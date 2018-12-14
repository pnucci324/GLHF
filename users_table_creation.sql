use esports;
DROP TABLE COMMENTS;
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
	VALUES ('Tim', 'Strickler', 'timstri', '1111', 'tsstric@pointpark.edu');
    
SELECT * FROM USERS;

CREATE TABLE COMMENTS
(	commentId INT AUTO_INCREMENT,
    userId INT,
    commentText TEXT,
    createdDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    linkedImage VARCHAR(50),
    PRIMARY KEY (commentId),
    FOREIGN KEY (userId) REFERENCES USERS(userId)
);

INSERT INTO COMMENTS (userId, commentText, linkedImage)
	VALUES (1, 'This is  a comment!', 'img1.jpg');

SELECT * FROM COMMENTS;