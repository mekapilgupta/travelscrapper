// // const { createClient } = require('@supabase/supabase-js');
// // const path = require('path');

// // // Supabase client for reading data
// // const supabaseUrlRead = 'https://nzegsplwspdegfvkyyyj.supabase.co'; // Replace with your read account URL
// // const supabaseKeyRead = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZWdzcGx3c3BkZWdmdmt5eXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5ODQwMDQsImV4cCI6MjA0MjU2MDAwNH0.n9s-AyhG3GuaUhU4O7GCSZB2b9ySOWMRUyn29pIjYJ0'; // Replace with your read account key
// // const supabaseRead = createClient(supabaseUrlRead, supabaseKeyRead);

// // // Supabase client for writing data
// // const supabaseUrlWrite = 'https://lxukddwtmwrpfxdzwtes.supabase.co'; // Replace with your write account URL
// // const supabaseKeyWrite = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dWtkZHd0bXdycGZ4ZHp3dGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMDA4NjcsImV4cCI6MjA0NzY3Njg2N30.HnUSNLDKHIF8Jnrz98jfCSXdiYus39E8zwztVCgFAQU'; // Replace with your write account key
// // const supabaseWrite = createClient(supabaseUrlWrite, supabaseKeyWrite);

// // const batchSize = 100; // Number of records to process in each batch
// // let offset = 0; // Starting offset for the first batch

// // const readAndInsertBatch = async () => {
// //   try {
// //     // Read a batch of data from supabaseRead
// //     const { data, error } = await supabaseRead
// //       .from('cities')
// //       .select('*')
// //       .range(offset, offset + batchSize - 1);

// //     if (error) {
// //       console.error('Error reading data:', error);
// //       return;
// //     }

// //     if (data.length === 0) {
// //       console.log('No more data to process');
// //       return;
// //     }

// //     // Insert the batch of data into supabaseWrite
// //     const { data: insertedData, error: insertError } = await supabaseWrite
// //       .from('cities')
// //       .insert(data);

// //     if (insertError) {
// //       console.error('Error inserting data:', insertError);
// //       return;
// //     }

// //     console.log(`Inserted ${data.length} records`);

// //     // Update the offset for the next batch
// //     offset += batchSize;

// //     // Process the next batch
// //     readAndInsertBatch();
// //   } catch (error) {
// //     console.error('Error:', error);
// //   }
// // };

// // // Start processing batches
// // readAndInsertBatch();


// const { createClient } = require('@supabase/supabase-js');
// const path = require('path');

// // Supabase client for reading data
// const supabaseUrlRead = 'https://nzegsplwspdegfvkyyyj.supabase.co'; // Replace with your read account URL
// const supabaseKeyRead = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56ZWdzcGx3c3BkZWdmdmt5eXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5ODQwMDQsImV4cCI6MjA0MjU2MDAwNH0.n9s-AyhG3GuaUhU4O7GCSZB2b9ySOWMRUyn29pIjYJ0'; // Replace with your read account key
// const supabaseRead = createClient(supabaseUrlRead, supabaseKeyRead);

// // Supabase client for writing data
// const supabaseUrlWrite = 'https://lxukddwtmwrpfxdzwtes.supabase.co'; // Replace with your write account URL
// const supabaseKeyWrite = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dWtkZHd0bXdycGZ4ZHp3dGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIxMDA4NjcsImV4cCI6MjA0NzY3Njg2N30.HnUSNLDKHIF8Jnrz98jfCSXdiYus39E8zwztVCgFAQU'; // Replace with your write account key
// const supabaseWrite = createClient(supabaseUrlWrite, supabaseKeyWrite);

// const batchSize = 100; // Number of records to process in each batch
// let offset = 0; // Starting offset for the first batch
// const totalRecords = 3000; // Total number of records to process

// const readAggregatedRestaurants = async () => {
//   try {
//     // Read a batch of data from supabaseWrite
//     const { data, error } = await supabaseWrite
//       .from('aggregated_restaurants')
//       .select('*')
//       .range(offset, offset + batchSize - 1);

//     if (error) {
//       console.error('Error reading data:', error);
//       return;
//     }

//     if (data.length === 0) {
//       console.log('No more data to process');
//       return;
//     }

//     // Insert the batch of data into supabaseRead
//     try {
//       const { data: insertedData, error: insertError } = await supabaseRead
//         .from('individual_restaurants')
//         .insert(data.map((restaurant) => ({
//           city: restaurant.city_name,
//           country: restaurant.country_name,
//           restaurantName: restaurant.restaurant,
//           mentioned_in_websites: restaurant.urls,
//           city_id: restaurant.city_id,
//         })));

//       if (insertError) {
//         console.error('Error inserting data:', insertError);
//       } else {
//         console.log(`Inserted ${data.length} records`);
//       }
//     } catch (insertError) {
//       console.error('Error inserting data:', insertError);
//     }

//     // Update the offset for the next batch
//     offset += batchSize;

//     // Check if we've processed all records
//     if (offset >= totalRecords) {
//       console.log('All records processed');
//       return;
//     }

//     // Add a delay before processing the next batch
//     setTimeout(readAggregatedRestaurants, 1000); // 1 second delay
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };

// // Start processing batches
// readAggregatedRestaurants();
