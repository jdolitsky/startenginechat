StartEngine Chat
===============

![](http://socialmediaweek.org/losangeles/files/2012/08/start-engine-logo.jpg)

### How to run

Install Meteor JS:

    curl https://install.meteor.com | /bin/sh
    
Create new Meteor app called 'se':

    meteor create se
    
Remove default Meteor files:

    rm -rf se/*
    
Clone this repository:

    git clone git@github.com:jdolitsky/startenginechat.git

Copy files from github into Meteor directory:

    cp -r startenginechat/* se/
    
Enter Meteor app directory:

    cd se/
    
Run Chat app:

    meteor run
    
Access app in browser:

    http://localhost:3000
