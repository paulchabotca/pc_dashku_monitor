# DEPRECATED

A new version of Dashku will be coming in the future. This version is redundant.

[![Build Status](https://travis-ci.org/dashku/dashku.svg)](https://travis-ci.org/dashku/dashku)
[![Coverage Status](https://coveralls.io/repos/dashku/dashku/badge.svg?branch=master)](https://coveralls.io/r/dashku/dashku?branch=master)
[![Dependency Status](https://david-dm.org/dashku/dashku.svg)](https://david-dm.org/dashku/dashku)
[![Dev Dependency Status](https://david-dm.org/dashku/dashku/dev-status.svg)](https://david-dm.org/dashku/dashku#info=devDependencies)
[![Code Climate](https://codeclimate.com/github/dashku/dashku.svg)](https://codeclimate.com/github/dashku/dashku)
[![Gitter chat](https://badges.gitter.im/dashku/dashku.svg)](https://gitter.im/dashku/dashku)
[![Issue Stats](http://issuestats.com/github/dashku/dashku/badge/pr)](http://issuestats.com/github/dashku/dashku)
[![Issue Stats](http://issuestats.com/github/dashku/dashku/badge/issue)](http://issuestats.com/github/dashku/dashku)

Dashku (classic edition)
===

![Dashku Screenshot](https://raw.github.com/dashku/dashku/master/dashku-screenshot.png)

Introduction
---

Dashku is a web application for creating dashboards and widgets in HTML, CSS, and JavaScript. It is open source, and available to download from Github. There is also a [hosted edition at Dashku.com](https://dashku.com).

Dependencies
---

- Node.js (0.10)
- MongoDB
- Redis

Install on Heroku
---

You can also deploy your own copy with Heroku's click-to-deploy button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/anephenix/dashku)

Note: If you deploy to Heroku, you will want to enable these features in Heroku Labs for your app:
    
    heroku labs:enable http-session-affinity
    heroku labs:enable http-end-to-end-continue

This will ensure that the app's use of WebSockets will work smoothly.

Installation (with Docker)
---

The best way to install Dashku with Docker is by using Docker Compose:

    docker pull anephenix/dashku
    docker-compose up

We will be working on getting linked containers to work with Dashku's docker container, as well as updating the container with the latest version of Dashku.

Manual installation (with Git)
---

    git clone git://github.com/Anephenix/dashku.git
    cd dashku
    npm install

Booting the application
---

    mongod &
    redis-server &
    npm start

Seeding the database with widget templates
---

You can seed Dashku's database with widget templates by running this command:

    npm run populateWidgetTemplates

If using docker-compose then run the following:

    docker-compose run web npm run populateWidgetTemplates

Using Dashku to create dashboards and widgets
---

Documentation will be coming soon.

Development and Testing
---

If you wish to extend Dashku, and want to know run unit/functional tests, do this:

    npm test

To run the integration tests:

    npm run cuke

Code coverage is currently in the region of 74%. This will be increasing in the near future.

License & Credits
---

&copy; 2015 Anephenix Ltd. The Nike swoosh is a registered trademark of Nike Inc. Dashku is a trademark of Anephenix Ltd, and dashku is licenced under the LGPLv3 license. See LICENSE for details.
