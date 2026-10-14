/**
 * A row of the counting frame is stored as the number of beads still on the left.
 * A bead tapped on the left slides to the right together with all beads to its right,
 * a bead tapped on the right slides back together with all beads to its left –
 * like on a real counting frame. Returns the new number of beads on the left.
 */
export function moveBead(left: number, bead: number): number {
  return bead < left ? bead : bead + 1
}
