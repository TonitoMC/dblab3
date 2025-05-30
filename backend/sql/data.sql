-- File: sql/data.sql

-- Equipos
INSERT INTO "Equipo" (nombre, liga, pais, fundado) VALUES
('FC Barcelona', 'La Liga', 'España', 1899),
('Real Madrid', 'La Liga', 'España', 1902),
('Manchester City', 'Premier League', 'Inglaterra', 1880),
('PSG', 'Ligue 1', 'Francia', 1970),
('Bayern Munich', 'Bundesliga', 'Alemania', 1900);

-- Jugadores
INSERT INTO "Jugador" (nombre, posicion, edad, nacionalidad, "createdAt") VALUES
('Lionel Messi', 'Delantero', 36, 'Argentina', NOW()),
('Erling Haaland', 'Delantero', 24, 'Noruega', NOW()),
('Kevin De Bruyne', 'Mediocampista', 32, 'Bélgica', NOW()),
('Kylian Mbappé', 'Delantero', 25, 'Francia', NOW()),
('Manuel Neuer', 'Portero', 38, 'Alemania', NOW()),
('Joshua Kimmich', 'Mediocampista', 29, 'Alemania', NOW()),
('Vinícius Jr', 'Delantero', 23, 'Brasil', NOW());

-- JugadorEquipo
INSERT INTO "JugadorEquipo" ("jugadorId", "equipoId", "fechaIngreso") VALUES
((SELECT id FROM "Jugador" WHERE nombre = 'Lionel Messi'), (SELECT id FROM "Equipo" WHERE nombre = 'FC Barcelona'), '2004-07-01'),
((SELECT id FROM "Jugador" WHERE nombre = 'Lionel Messi'), (SELECT id FROM "Equipo" WHERE nombre = 'PSG'), '2021-08-10'),
((SELECT id FROM "Jugador" WHERE nombre = 'Erling Haaland'), (SELECT id FROM "Equipo" WHERE nombre = 'Manchester City'), '2022-07-01'),
((SELECT id FROM "Jugador" WHERE nombre = 'Kevin De Bruyne'), (SELECT id FROM "Equipo" WHERE nombre = 'Manchester City'), '2015-08-30'),
((SELECT id FROM "Jugador" WHERE nombre = 'Kylian Mbappé'), (SELECT id FROM "Equipo" WHERE nombre = 'PSG'), '2017-07-01'),
((SELECT id FROM "Jugador" WHERE nombre = 'Manuel Neuer'), (SELECT id FROM "Equipo" WHERE nombre = 'Bayern Munich'), '2011-06-01'),
((SELECT id FROM "Jugador" WHERE nombre = 'Joshua Kimmich'), (SELECT id FROM "Equipo" WHERE nombre = 'Bayern Munich'), '2015-07-01'),
((SELECT id FROM "Jugador" WHERE nombre = 'Vinícius Jr'), (SELECT id FROM "Equipo" WHERE nombre = 'Real Madrid'), '2018-07-01');

-- Estadistica
INSERT INTO "Estadistica" ("jugadorId", "partidosJugados", goles, asistencias, temporada) VALUES
((SELECT id FROM "Jugador" WHERE nombre = 'Lionel Messi'), 30, 20, 15, 'T2022_2023'),
((SELECT id FROM "Jugador" WHERE nombre = 'Lionel Messi'), 28, 25, 12, 'T2023_2024'),
((SELECT id FROM "Jugador" WHERE nombre = 'Erling Haaland'), 34, 36, 5, 'T2022_2023'),
((SELECT id FROM "Jugador" WHERE nombre = 'Kevin De Bruyne'), 32, 10, 18, 'T2022_2023'),
((SELECT id FROM "Jugador" WHERE nombre = 'Kylian Mbappé'), 30, 28, 10, 'T2023_2024'),
((SELECT id FROM "Jugador" WHERE nombre = 'Manuel Neuer'), 25, 0, 0, 'T2023_2024'),
((SELECT id FROM "Jugador" WHERE nombre = 'Joshua Kimmich'), 31, 4, 9, 'T2022_2023'),
((SELECT id FROM "Jugador" WHERE nombre = 'Vinícius Jr'), 33, 12, 14, 'T2023_2024');


