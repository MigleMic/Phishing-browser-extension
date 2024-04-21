// Helper functions
import { insertToLoggerTable } from "./insertDatabaseInformation.js";
// Helper function to check if given website exists
export async function checkWebsiteExistence (url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      insertToLoggerTable(error, 'Error checking website existence:');
      return false;
    }
}