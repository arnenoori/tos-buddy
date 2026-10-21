// api/favicon.ts
// Handles favicon retrieval and storage
// Make sure that you have set up a storage bucket named "favicons" in your Supabase project to store the favicon files.
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import imagemagick from 'imagemagick';
import stream from 'stream';

config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// Download favicon, convert to PNG, and store in Supabase Storage

// // sharp, imagemagick, jump, ico-to-png not working need to use another package manager
export async function downloadFavicon(domain: string): Promise<string | null> {
    const hostname = new URL(domain).hostname;
    const filename = `${hostname}_favicon.png`; // Change the extension to .png
  
    // Try different approaches to construct the faviconUrl
    const faviconUrlAttempts = [
      `${domain}/favicon.ico`, // Try the root path first
      `https://${hostname}/favicon.ico`,
      `https://www.${hostname}/favicon.ico`,
      `${domain}/static/favicon.ico`,
      `${domain}/assets/favicon.ico`,
      `${domain}/images/favicon.ico`,
    ];

    for (const faviconUrl of faviconUrlAttempts) {
        console.log(`Attempting to download favicon from ${faviconUrl}`);
    
        try {
          const tempFilePath = path.join(__dirname, `${hostname}_favicon.ico`);
          const outputFilePath = path.join(__dirname, filename);
    
          const response = await new Promise<http.IncomingMessage>((resolve, reject) => {
            https.get(faviconUrl, (res) => {
              resolve(res);
            }).on('error', (err) => {
              reject(err);
            });
          });
    
          if (response.statusCode === 200) {
            const fileStream = fs.createWriteStream(tempFilePath);
            response.pipe(fileStream);
    
            fileStream.on('finish', async () => {
              fileStream.close();
              console.log(`Downloaded favicon to ${tempFilePath}`);
    
              try {
                const readStream = fs.createReadStream(tempFilePath);
                const writeStream = fs.createWriteStream(outputFilePath);
    
                await new Promise((resolve, reject) => {
                  stream.pipeline(
                    readStream,
                    imagemagick().convert(['-flatten', 'png:-']),
                    writeStream,
                    (err) => {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(null);
                      }
                    }
                  );
                });
    
                console.log(`Converted favicon to PNG at ${outputFilePath}`);
    
                const { data, error } = await supabase.storage
                  .from('favicons')
                  .upload(filename, fs.createReadStream(outputFilePath));
    
                if (error) {
                  console.error('Error uploading favicon to Supabase Storage:', error.message);
                  return null;
                } else {
                  console.log('Favicon uploaded to Supabase Storage:', data);
                  const { data: publicUrlData } = supabase
                    .storage
                    .from('favicons')
                    .getPublicUrl(filename);
                  return publicUrlData.publicUrl;
                }
              } catch (conversionError) {
                console.error('Error converting favicon:', conversionError.message);
                return null;
              } finally {
                fs.unlinkSync(tempFilePath);
                fs.unlinkSync(outputFilePath);
              }
            });
          } else {
            console.log(`Failed to download favicon from ${faviconUrl}`);
          }
        } catch (error) {
          console.error(`Error downloading favicon from ${faviconUrl}:`, error.message);
        }
      }
    
      console.error('Unable to download favicon after multiple attempts.');
      return null;
    }