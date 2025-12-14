import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Get video duration in seconds using ffprobe
 */
export async function getVideoDuration(filePath: string): Promise<number> {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "${filePath}"`
    );

    const duration = Math.round(Number(stdout));

    if (isNaN(duration)) {
      throw new Error('Invalid duration value from ffprobe');
    }

    return duration;
  } catch (error) {
    console.error('❌ Error while getting video duration:', error);
    return 0; // fallback علشان السيستم ميقعش
  }
}
