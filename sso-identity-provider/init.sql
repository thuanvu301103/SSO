CREATE TABLE users (
  username VARCHAR(255) PRIMARY KEY,
  password VARCHAR(1000) NOT NULL
);

INSERT INTO users (username, password) VALUES  ('namsrovn', '0722a833362ffc0b30d6230f2e4e8afff2482e8b3908da2a72f8540242f90a0c0daa896e8e4cf320f3847cecb7e0ca45181fd9eb3d69995bfe8ba474c039f961');

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL
);
INSERT INTO roles (username, role) VALUES ('namsrovn', 'admin');
INSERT INTO roles (username, role) VALUES ('namsrovn', 'user');

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  urlorigin VARCHAR(255) NOT NULL,
  sessiontoken VARCHAR(1000) NOT NULL,
  ssotoken VARCHAR(1000) NOT NULL,
  username VARCHAR(255) NOT NULL,
  time TIMESTAMP NOT NULL
);