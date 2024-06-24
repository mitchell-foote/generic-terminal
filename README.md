# generic-terminal

An interface to place terminal-esque games in a web/electron environment

## About

This project holds the logic for various terminal-esque games that provide fun interactivity in a terminal-like setting. These projects were originally used by the Christa McAcliffe Space Center, but can be utilized in other settings as well. 

The games themselves are coded into the project, but the configuration of those games are located on the file system of the computer that is running the project. This allows for variants of these common games that can be played in different situations, without having the larger task of providing a full interface to create "from the ground up" games. 

## Included Games

Currently the games are available are below:
1. Reactor Interface 
    - This game gives access to a star ship reactor, and gives the user three options. Stop an overload, restart the reactor, and remove the shielding system. Configuration files allow the provider of the game to customize multiple aspects, and in the case of the shielding system, the correct answer. 

More games are being built soon!

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```
