import { GameOptions } from "./Game";
import { Game } from "./lib/games";

type args = {
    options : GameOptions
    setGameSettings : (options: GameOptions) => void
};

const gameOptions : Game[] = ["chess", "checkers"];

function GameSettingsForm({options, setGameSettings} : args) {
    return ( 
        <div>
            <p>Black game:
                <select 
                    value={options.black}
                    className="text-black"
                    onChange={
                        (e) => {
                            setGameSettings({
                                ...options,
                                // @ts-expect-error this will always be a valid string
                                black: e.target.value
                            });
                        }
                    }
                    >
                        {
                            gameOptions.map((game) => 
                                <option key={game} value={game}>{game}</option>
                            )
                        }
                </select>
            </p>
            <p>White game:
                <select 
                    value={options.white}
                    className="text-black"
                    onChange={
                        (e) => {
                            setGameSettings({
                                ...options,
                                // @ts-expect-error this will always be a valid string
                                white: e.target.value
                            });
                        }
                    }
                    >
                        {
                            gameOptions.map((game) => 
                                <option key={game} value={game}>{game}</option>
                            )
                        }
                </select>
            </p>
            <p>Playing as: 
                <select 
                    value={options.realPlayer}
                    className="text-black"
                    onChange={
                        (e) => {
                            setGameSettings({
                                ...options,
                                // @ts-expect-error this will always be a valid string
                                realPlayer: e.target.value
                            });
                        }
                    }
                    >
                    <option value="red">red</option>
                    <option value="black">black</option>
                </select>
            </p>
            <p>Automatically play best move for opponent?
                <input 
                    type="checkbox"
                    checked={options.autoMove}
                    onChange={
                        (e) => {
                            setGameSettings({
                                ...options,
                                autoMove: e.target.checked
                            });
                        }
                    }
                />
            </p>
        </div>
    );
}

export default GameSettingsForm;