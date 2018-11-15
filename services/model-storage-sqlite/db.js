import SQL from 'sql-template-strings';
import sqlite from 'sqlite';

// es-lint-ignore-nextline
const db = await sqlite.open('./database.sqlite');
