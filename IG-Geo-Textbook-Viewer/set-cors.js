import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://sxcrxvoqyewvshqoskmx.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY is not set in the environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateBucketCors() {
    console.log("Connecting to Supabase storage backend...");

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    console.log("Available buckets:", buckets, "Error if any:", listError);

    const hasBucket = buckets && buckets.some(b => b.id === 'igcse-coursebook');

    if (!hasBucket) {
        console.log("Creating 'igcse-coursebook' bucket...");
        const { data: createData, error: createError } = await supabase
            .storage
            .createBucket('igcse-coursebook', {
                public: true,
                allowedMimeTypes: ['application/pdf'],
                fileSizeLimit: 52428800 // 50MB
            });
        if (createError) {
            console.error("Failed to create bucket:", createError.message);
        } else {
            console.log("Bucket created successfully!", createData);
        }
    } else {
        console.log("Updating existing bucket settings...");
        const { data, error } = await supabase
            .storage
            .updateBucket('igcse-coursebook', {
                public: true,
                allowedMimeTypes: ['application/pdf'],
                fileSizeLimit: 52428800 // 50MB
            });

        if (error) {
            console.error("Failed to update bucket:", error.message);
        } else {
            console.log("Bucket policies successfully synchronized!", data);
        }
    }
}

updateBucketCors();