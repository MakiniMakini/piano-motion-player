# piano-motion-player
play piano using webcam: in development 

# About 
Based on Colt-Steele Online code challenges, we made this project to improve learning and try out different concepts

# Libraries Used
```jquery```
```buffer-loader js```

# Explanation

To detect the user’s movement We used a technic know as, the ```blend mode difference.```
The concept is, if you put a picture on top of the same picture and blend them together using the blend mode difference, you obtain… a black screen!
Loop over the pixels of the current frame and  subtract the pixels color from the same pixel color of the previous frame. 
This is what the blend mode difference is doing: “Difference subtracts the top layer from the bottom layer or the other way round, to always get a positive value.”.
The next step is checking in some areas (the different parts of the piano) if you have some white pixels in them.
If you get a certain amount of non-black pixels in this area, it means that something moved since the last frame and  a note is played.

# Installation 
To use the project locally, follow the following instructions: 
## Clone
Clone this repo to your local machine
## Server
Initiate your local server and run 
```index.html```
## Authors

* **Makini Makini** - *Initial work* - [https://github.com/MakiniMakini)
* **Collins Muriuki** - *Initial work* - [https://github.com/collinsmuriuki)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* We give a hat tip to anyone whose code has been used in the project
