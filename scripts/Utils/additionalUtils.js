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

// Helper function to log information on html, for testing purposes
export function logMessage(message) {
  const logContainer = document.getElementById('log-container');
  const logMessage = document.createElement('div');
  logMessage.textContent = message;
  logContainer.appendChild(logMessage);
}