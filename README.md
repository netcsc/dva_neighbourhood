# GATech CSE6242 Data and Visual Analytics Project Repo

This is the repo for CSE 6242 Data and Visual Analytics project. A place for project team member to share code and collaborate


## Project team member
| Name | Email | Location | TimeZone |Available Time (EST)|
|----|----|---|---|---|
| Jun Peng | jpeng75@gatech.edu | New York City|EST| Weekday 9p.m. - 11:30 p.m. Weekend 9 a.m - 1 p.m |
| Boyan Lu | blu71@gatech.edu |Seattle|PST(EST-3hrs)|Weekday 10p.m. - 2 a.m. Sat 6 p.m. - 2 a.m. Sunday 1 p.m. - 2 a.m.|
| Shi Chen| shi.chen@gatech.edu |Toronto|EST|Weekday 9p.m. - 12 a.m. Sat 1 p.m. - 4 p.m.,9p.m. - 12 a.m. Sunday 8 a.m. - 12 p.m.,9p.m. - 12 a.m.|
| Siwei Wang| siwei.wang@gatech.edu |Toronto|EST|Weekday 9p.m. - 12 a.m. Sat 1 p.m. - 12 a.m. Sunday 10 a.m. - 11 p.m.|
| Neal Manaktola| nmanaktola3@gatech.edu |Toronto|EST|Weekday 7p.m. - 10 p.m. Sat 1 p.m. - 10 p.m. Sunday 1 p.m. - 10 p.m.|
| Yuying Wang| ywang3391@gatech.edu  |China|CST(EST+13hrs)|Weekday and weekends 9a.m. - 11a.m; 9p.m. - 12a.m|

## API

The API returns the housing data from postgres db. The database has been seeded with the data as specified in NY_neighborhood_avg_sales_2018.csv.

The API app is built in python and has dependencies as specified in the requirements.txt.
If you want to run this API locally:

1. Install virtualenv https://docs.python-guide.org/dev/virtualenvs/
2. Create virtual env `virtualenv .venv`
3. Install dependencies `pip install -r requirements.txt`
4. Please note you need to have postgresql installed as well.

Server IP: `54.89.25.157`
Endpoints: `/boroughs` to get the aggregate housing data i.e `http://54.89.25.157/boroughs`

### Test API locally

1. Start local postgrest database `docker run --name postgres -e POSTGRES_PASSWORD=cse6242 -p 5432:5432 -d postgres`
1. Create a database in postgres CREATE DATABASE neighbourhood;
1. Start the API server `Gunicorn -b 0.0.0.0:5000 app:api --reload`

## Project Requirement
[link](https://docs.google.com/document/d/e/2PACX-1vTc_2yqk8QfK-SkdDPxJVJcM31kogiVFsZKOuJ2qHHnRn5aaA4r74u-gErMTsE8jGVoYeVB83MtjFTN/pub)


## Project ideas
[Some data set ideas](https://poloclub.github.io/cse6242-2019spring-online/#datasets)
TBD

## Meeting notes

### Jan 17 2019

#### attendees

Everyone :-)

#### Outline

1. Team introduction

1. Impression about the course and project.

1. Planning of the project's next step.

#### Action item

1. Schedule next meeting on Feb 1 for project idea sync up

    *Owner*: Siwei

2. Come up with 2 project ideas (1 primary and 1 backup).

Please read project requirement on the website as well the Slide that Jun shared http://poloclub.gatech.edu/cse6242/2017spring/slides/CSE6242-999-project.pdf ( Thank you Jun!)

Please special attention to slide 9:

Heilmeier Questions:

1. What are you trying to do? Articulate your objectives using absolutely no jargon.

2. How is it done today; what are the limits of current practice?

3. What's new in your approach; why it will be successful?

4. Who cares?

5. If you're successful, what difference and impact will it make? How do you measure them (e.g., via user studies, experiments, groundtruth data, etc.)?

6. What are the risks and payoffs?

7. How much will it cost?

8. How long will it take?

9. What are the midterm and final "exams" to check for success?

Come prepared for these question for the project that you choose.

*Owner*: All