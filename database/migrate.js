const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const runSQLFiles = async () => {
  try {
    await client.connect();
    const sqlFiles = [
      "database.sql",
      "01_Users_Table_Changes.sql",
      "02_Rename_Message_Timestamp.sql",
      "03_Add_Bio.sql",
      "04_Remove_isReply.sql",
      "05_Update_Follow_Table.sql",
      "06_Post_Table_Addition.sql",
      "07_Edit_Post_Addition.sql",
    ];

    // Iterate over each file and run them sequentially
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, "sql", file); // Assuming files are in a 'sql' directory
      const sql = fs.readFileSync(filePath, "utf-8");
      console.log(`Running ${file}...`);

      // Execute the SQL content from the file
      await client.query(sql);
      console.log(`${file} executed successfully.`);
    }
  } catch (error) {
    console.error("Error running SQL files:", error);
  } finally {
    await client.end();
  }
};

runSQLFiles();
