use esports;

DROP TABLE USERS;

CREATE TABLE USERS 
(	userId INT AUTO_INCREMENT, 
	firstName VARCHAR(25), 
	lastName VARCHAR(25), 
    loginId VARCHAR(30), 
    password VARCHAR(30),
    email VARCHAR(40),
    createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userId)
);

INSERT INTO USERS (firstName, lastName, loginId, password, email)
VALUES ('Tim', 'Strickler', 'timstri', '1111', 'tim@pneity.org');
SELECT * FROM USERS;