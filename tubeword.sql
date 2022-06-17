
CREATE TABLE IF NOT EXISTS WordLinks --Initialize main table
(
	Word varchar(11) NOT NULL,
    Link text NOT NULL,
	id SERIAL PRIMARY KEY --Needed for choosing random links
);

DROP TABLE WordLinks;

COPY WordLinks(Word, Link) FROM 'wordLinks.csv' WITH (FORMAT CSV, HEADER TRUE); --Import data
--This command should be called with \COPY in the PostgreSQL terminal

SELECT * FROM WordLinks WHERE length(Word) = 5; --Simple testing commands
SELECT COUNT(id) FROM WordLinks;
SELECT * FROM WordLinks WHERE false;