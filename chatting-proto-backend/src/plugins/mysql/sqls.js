const createTableUser = `
CREATE TABLE user (
  id VARCHAR(25) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL UNIQUE,
  PRIMARY KEY (id, name)
)
`

const createTableRoom = `
CREATE TABLE room (
  title VARCHAR(100) NOT NULL,
  create_by VARCHAR(50) NOT NULL,
  pw VARCHAR(20) NOT NULL,
  max_join INT NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (title),
)`

const createTableParticipant = `
CREATE TABLE participant (
  room_title VARCHAR(100) NOT NULL,
  user_id VARCHAR(25) NOT NULL,
  PRIMARY KEY (room_title, user_name),
  FOREIGN KEY (room_title) REFERENCES room (title) ON UPDATE CASCADE ON DELETE CASCADE
  FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE CASCADE ON DELETE CASCADE
)`
