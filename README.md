# ImageStorage-backend

# Babbl Frontend

<p align="center"><img src="./assets/image-storage-logo.png"></p>

A backend repository for Image Storage. A simple Image storing application developed using React-Native and GraphQL with MongoDB and Cloudinary to store data

Tech stack used – React-Native and GraphQL.

This is the frontend repository for ImageStorage. If you are looking for the frontend repository, [click here](https://github.com/ShanmukhSreenivas/ImageStorage-frontend).

Developed as a part of as an assignment for Cilire Digital Intern recuirt process.

###### Note

Following versions were used in the development of this project:

* Node.js 14.16.1.
* Node Package Manager (npm) 7.12.1.
* Editor used was Visual Studio Code 1.57.1.

## Table of contents
* [Instructions to setup locally](#instructions-to-setup-locally)
  * [Installing modules](#installing-modules)
  * [Running the app](#running-the-app)
* [Contributing](#contributing)

## Instructions to setup locally

### Installing modules

* Run the following commands in the terminal/console window in the project directory:

```bash
$ cd ImageStorage-backend

$ npm install
```

### Running the app

* Create a ```.env``` file at the root of the project under the following schema:

```env
JWT_SECRET=<YOUR-JWT-SECRET-HERE>
JWT_EXPIRE=<JWT-EXPIRE-TIME>
GOOGLE_CLIENT_ID=<YOUR-GOOGLE-CLIENT-ID>
GOOGLE_CLIENT_SECRET=<YOUR-GOOGLE-CLIENT-SECRET>
FACEBOOK_CLIENT_ID=<YOUR-FACEBOOK-CLIENT-ID>
FACEBOOK_CLIENT_SECRET=<YOUR-FACEBOOK-CLIENT-SECRET>
```
* Create an App in [Developers.Facebook](https://developers.facebook.com/apps/) and generate your Client Id and Secret

* Create an App in [Developers.Google](https://console.developers.google.com/) and generate your Client Id and Secret

* Run the following commands in the terminal/console window to run ImageStorage Backend:

```bash
$ cd ImageStorage-backend

$ npm start
```

## Contributing

* Fork this project by clicking the ```Fork``` button on top right corner of this page.
* Open terminal/console window.
* Clone the repository by running following command in git:

```bash
$ git clone https://github.com/[YOUR-USERNAME]/ImageStorage-backend.git
```

* Add all changes by running this command.

```bash
$ git add .
```

* Or to add specific files only, run this command.

```bash
$ git add path/to/your/file
```

* Commit changes by running these commands.

```bash
$ git commit -m "DESCRIBE YOUR CHANGES HERE"

$ git push origin
```

* Create a Pull Request by clicking the ```New pull request``` button on your repository page.
