const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase Umgebungsvariablen nicht gefunden!');
}

console.log('Verbinde mit Supabase...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Erstelle Tweets-Tabelle...');
    
    // Versuche direkt einen Tweet einzufügen
    const { data, error } = await supabase
      .from('tweets')
      .insert([
        {
          content: 'Initialer Tweet',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Fehler beim Erstellen der Tabelle:', error);
      console.error('Fehlerdetails:', JSON.stringify(error, null, 2));
    } else {
      console.log('Datenbank erfolgreich eingerichtet!');
      console.log('Erstellte Daten:', data);
    }
  } catch (error) {
    console.error('Unerwarteter Fehler:', error);
  }
}

// Führe das Setup aus
setupDatabase();
