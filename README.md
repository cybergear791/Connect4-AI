# Desc
The minmax algorithm was used to find the optimal move for the AI. Letting the AI be the Maximizer Player, and the User be the Minimizer, board states that are a win for the AI return the value 100 - depth, and return -100 + depth for winning board states for the User. Facorting the depth of the board state into the minmax value is so that the AI chooses a move that will lead to a sooner win.

Alpha-Beta Pruning was incorporated to reduce the number of subtrees that are evaluated by the minmax function, by not exploring subtrees whose board moves will not be chosen as the optimal move, for their minmax value could not be better than a previous explored subtrees.

The board move successors were arranged by likely optimal move (middle-most move), in order to optimize alpha-beta pruning.

# Install
- Install node.js from https://nodejs.org
- In the root folder of this project enter ```npm install``` to install the dependencies.
- Run ```npm start```
- Open http://localhost:3000 on your web browser to play.

# Game
You are Red and the Computer is Yellow. <br/>

Although the Computer plays the most optimal move, since the player plays first and Connect 4 being first-player-win, the player has the chance to defeat the computer, as long as their first move is in the middle column and that they play optimally.

![](https://github.com/cybergear791/Connect4-AI/blob/master/src/images/game.png)
