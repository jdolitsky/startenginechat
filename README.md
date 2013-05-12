StartEngine Chat
===============

Install Meteor:

    curl https://install.meteor.com | /bin/sh
    
Create new meteor app called 'se':

    meteor create se
    
Clone this repository:

    git clone git@github.com:jdolitsky/startenginechat.git
    
Copy files from github directory into new Meteor app:

    git clone git@github.com:jdolitsky/startenginechat.git
    
Remove default Meteor files

    rm -rf se/*

Copy files from github into Meteor directory:

    cp -r startenginechat/* se/
    
Enter Meteor app directory:

    cd se/
    
Run Chat app:

    meteor run
