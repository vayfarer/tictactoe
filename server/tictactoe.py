# Michael Chen
# tic tac toe game logic

import random
# game_state string definition:
# "012345678":
# 012
# 345
# 678

def win_condition(player: str, game_state: str) -> bool:
    """
    :param player: "X" or "O"
    :param game_state: 9 length string representing the board.
    :return: True or False, did player win the game?
    """
    for i in range(3):
        # rows and columns
        if game_state[i*3] == game_state[i*3+1] == game_state[i*3+2] == player:
            return True
        if game_state[i] == game_state[i+3] == game_state[i+6] == player:
            return True
    if (game_state[0] == game_state[4] == game_state[8] == player or
            game_state[2] == game_state[4] == game_state[6] == player):
        # diagonals
        return True
    return False


def draw_condition(game_state: str):
    """Returns true if game over at draw condition"""
    for c in game_state:
        if c == " ":
            return False
    return True


def move_win(pieces: set, move: int) -> bool:
    """
    Determines if move will win the game.
    :param pieces: your pieces, set of ints defining position in game_state
    string.
    :param move: the proposed move as int defining position in game_state
    string.
    """
    move_set = {move}
    if move % 2 == 0:
        # check diagonals for corners
        if (pieces | move_set).issuperset({0, 4, 8}):
            return True
        if (pieces | move_set).issuperset({2, 4, 6}):
            return True
    # check rows and columns
    row = (move // 3) * 3
    column = move % 3
    winning_set = {row, row + 1, row + 2}
    if (pieces | move_set).issuperset(winning_set):
        return True
    winning_set = {0 + column, 3 + column, 6 + column}
    if (pieces | move_set).issuperset(winning_set):
        return True
    return False


def two_move_win(two_move_available: set, pieces: set, move: int) -> bool:
    """
    Determines if move will force a win within 2 turns.
    :param two_move_available: set of moves available after move.
    """
    win_states = 0
    move_set = {move}
    two_move_pieces = two_move_available | pieces
    if move % 2 == 0:
        # check diagonals for corners
        if (two_move_pieces | move_set).issuperset({0, 4, 8}):
            win_states += 1
        if (two_move_pieces | move_set).issuperset({2, 4, 6}):
            win_states += 1
    # check rows and columns
    row = (move // 3) * 3
    column = move % 3
    winning_set = {row, row + 1, row + 2}
    if (two_move_pieces | move_set).issuperset(winning_set):
        win_states += 1
    winning_set = {0 + column, 3 + column, 6 + column}
    if (pieces | move_set).issuperset(winning_set):
        win_states += 1

        return True if win_states > 1 else False


def hard_ai(ai_player: str, game_state: str) -> int:
    """
    :param ai_player: "X" or "O"
    :return: returns an int representing the next move by AI as position in
    game_state string.
    """
    available = set()
    op_pieces = set()
    ai_pieces = set()
    # winning_sets = [{0,1,2}, {3,4,5}, {6,7,8}, {0,3,6}, {1,4,7}, {2,5,8}, {0,4,8}, {2,4,6}]

    for i in range(9):
        if game_state[i] == " ":
            available.add(i)
        elif game_state[i] == "X":
            if ai_player == 'X':
                ai_pieces.add(i)
            else:
                op_pieces.add(i)
        elif game_state[i] == "O":
            if ai_player == 'O':
                ai_pieces.add(i)
            else:
                op_pieces.add(i)

<<<<<<< HEAD
    # O second turn or later
    # win if possible
    for i in available:
        if move_win(ai_pieces, i):
            return i

    # block opponent win
    for i in available:
        if move_win(op_pieces, i):
            return i

    # set up 2 move win
    for i in available:
        second_moves = (available - {i})
        if two_move_win(second_moves, ai_pieces, i):
            return i

    # block opponent two move win if possible
    for i in available:
        second_moves = (available - {i})
        if two_move_win(second_moves, op_pieces, i):
            return i

    # return center if available
    if 4 in available:
        return 4
    # return a random corner, or random spot if not available
    corners_left = random.sample(list(available.intersection({0, 2, 6, 8})), 1)[0]
    return corners_left if corners_left else random.sample(list(available), 1)[0]
=======
    if len(available) >= 7:
        # return center if available
        if 4 in available:
            return 4
        # return a random corner if not available
        return random.sample(list(available.intersection({0, 2, 6, 8})), 1)[0]
    else:
        # O second turn or later
        # win if possible
        for i in available:
            if move_win(ai_pieces, i):
                return i

        # block opponent win
        for i in available:
            if move_win(op_pieces, i):
                return i

        # set up 2 move win
        for i in available:
            second_moves = (available - {i})
            if two_move_win(second_moves, ai_pieces, i):
                return i

        # block opponent two move win if possible
        for i in available:
            second_moves = (available - {i})
            if two_move_win(second_moves, op_pieces, i):
                return i

        # random move
        return random.sample(list(available), 1)[0]
>>>>>>> 8cbc31153f6788ffb8bbaef6b9a54737791af156


def easy_ai(ai_player: str, game_state: str) -> int:
    """
    Most of the time picks center or corner first move.
    Always wins and blocks in one move if possible.
    Forces two move wins if possible.
    Allows opponent two move wins.
    Otherwise moves randomly."""

    available = set()
    op_pieces = set()
    ai_pieces = set()

    for i in range(9):
        if game_state[i] == " ":
            available.add(i)
        elif game_state[i] == "X":
            if ai_player == 'X':
                ai_pieces.add(i)
            else:
                op_pieces.add(i)
        elif game_state[i] == "O":
            if ai_player == 'O':
                ai_pieces.add(i)
            else:
                op_pieces.add(i)

    # win if possible
    for i in available:
        if move_win(ai_pieces, i):
            return i

    # block opponent win
    for i in available:
        if move_win(op_pieces, i):
            return i

    # set up 2 move win
    for i in available:
        second_moves = (available - {i})
        if two_move_win(second_moves, ai_pieces, i):
            return i

    # random move
    return random.sample(list(available), 1)[0]















