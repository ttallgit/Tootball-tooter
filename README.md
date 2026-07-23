## Tootball Tooter

A retro-styled penalty shootout game with true penalty mechanics. The keeper can dive left, center, or right — you must aim precisely and choose the right power to score.

### Controls

| Key | Action |
|---|---|
| `↑` | Run forward |
| `←` `→` `↑` `↓` | Aim crosshair in the goal |
| `SPACE` (hold) | Charge power |
| `SPACE` (release) | Shoot |

### How to Play

1. Pick a mode and a tiger
2. Press ↑ to start your run
3. A crosshair appears in the goal — aim with the arrow keys
4. Hold SPACE to charge power (power bar oscillates)
5. Release SPACE to shoot
6. Ball placement + power vs. keeper dive determines goal/save/post

### Keeper Logic

- Keeper dives **left**, **center**, or **right** — you don't know which
- Each dive has a **save zone** around it — shots inside it are saved
- Shots to the opposite side or tight corners beat the keeper
- **Top/bottom corners** are harder for the keeper to reach
- **Power matters**: more power = ball is faster (keeper has less effective reach), but slightly less accurate
- **Keeper learns**: after each shot, the keeper adjusts their dive probability based on where you've been aiming — mix up your placement

### Game Modes

#### Normal
Standard keeper learning rate and base save zone.

#### Hard
Keeper learns faster from your tendencies. Save zone is slightly larger.

### Scoring

- 5 shots per round
- Score all 5 for a perfect game
- Hitting the post or missing counts as a miss

### Playable Tigers

Roary (orange), Atlas (blue), Sege (green), Nessie (purple), Telix (red) — cosmetic only.
