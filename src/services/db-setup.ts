import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Lade die Umgebungsvariablen
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase Umgebungsvariablen nicht gefunden!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  // Erstelle die Tweets-Tabelle
  const { error: createError } = await supabase
    .from('tweets')
    .insert([]) // Dummy-Insert um die Tabelle zu erstellen
    .select()
    .maybeSingle();

  if (createError?.code === '42P01') { // Tabelle existiert nicht
    const { error } = await supabase
      .from('tweets')
      .insert([
        {
          content: 'Initialer Tweet',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Fehler beim Erstellen der Tabelle:', error);
    } else {
      console.log('Datenbank erfolgreich eingerichtet!');
    }
  } else {
    console.log('Tabelle existiert bereits!');
  }
}

// Führe das Setup aus
setupDatabase(); 