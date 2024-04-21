// Helper functions

// Helper function to check if given website exists
export async function checkWebsiteExistence (url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('Error checking website existence:', error);
      return false;
    }
}