-- @block
CREATE TABLE IF NOT EXISTS Tasks(
	id					int				primary key		auto_increment,
	contest_id			int				not null,

	title				varchar(32)		not null,
	link				varchar(128)
);

-- @block
CREATE TABLE IF NOT EXISTS Contests(
	id					int 			primary key		auto_increment,
	competition_id		int				not null,

	title				varchar(64)		not null,
	num_of_tasks		int				not null,
	year				int				not null,
	round				int				not null
);

-- @block
CREATE TABLE IF NOT EXISTS Competitions(
	id					int				primary key		auto_increment,

	title				varchar(64)		not null		unique,
	first_year			int				not null,
	num_of_rounds		int				not null
);


-- @block
-- since the title is unique, if that competition is already in the table, it'll throw an error, but we have IGNORE. this is like IF NOT EXISTS :)
INSERT IGNORE INTO Competitions(title, first_year, num_of_rounds)
VALUES
		('oii', 2001, 1),
		("ois", 2014, 5);