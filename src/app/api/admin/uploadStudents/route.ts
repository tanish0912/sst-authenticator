import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { parse } from 'csv-parse';

// Export config to ensure proper handling of the route
export const config = {
    api: {
        bodyParser: false,
    },
};

// Handle OPTIONS request for CORS
export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file || !(file instanceof File)) {
            return NextResponse.json({ error: 'No file uploaded' }, { 
                status: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            });
        }

        // Read the file content
        const fileContent = await file.text();

        // Parse CSV content
        const records: string[][] = await new Promise((resolve, reject) => {
            parse(fileContent, {
                skip_empty_lines: true,
                trim: true
            }, (err, records) => {
                if (err) reject(err);
                resolve(records);
            });
        });

        // Process each row and upload to Firebase
        const batch = db.batch();
        let count = 0;

        for (let i = 1; i < records.length; i++) { // Skip header row
            const [rollNo, name, photoUrl] = records[i];
            
            // Create document reference with roll number as ID
            const docRef = db.collection('students').doc(rollNo);
            
            // Set the data
            batch.set(docRef, {
                name: name,
                photoUrl: photoUrl
            });
            
            count++;
        }

        // Commit the batch
        await batch.commit();

        return NextResponse.json({
            message: "Students data uploaded successfully",
            count: count
        }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });

    } catch (error) {
        console.error('Error uploading students:', error);
        return NextResponse.json(
            { error: 'Failed to process file upload' },
            { 
                status: 500,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                }
            }
        );
    }
}
