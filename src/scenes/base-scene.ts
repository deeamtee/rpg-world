import socket from '../utils/socket';
import { PlayerData } from '../types/player-data';

export type OtherPlayer = {
    id: string;
    x: number;
    y: number;
    name?: string;
    destroy: () => void;
    setPosition?: (x: number, y: number) => void;
};

export type OtherPlayerFactory = (playerData: PlayerData) => OtherPlayer;

export type MultiplayerCallbacks = {
    onOtherPlayerAdded?: (player: OtherPlayer) => void;
    onOtherPlayerRemoved?: (id: string) => void;
    onOtherPlayerMoved?: (id: string, x: number, y: number) => void;
};

export class BaseScene extends Phaser.Scene {
    protected otherPlayers: { [id: string]: OtherPlayer } = {};
    protected lastSentPlayerPos?: { x: number; y: number };
    private socketListeners: Array<{ event: string; handler: (...args: any[]) => void }> = [];

    constructor(sceneName: string) {
        super(sceneName);
    }

    /**
     * Основная настройка мультиплеера для сцены.
     * Внедряет фабрику создания других игроков и коллбеки для событий.
     */
    protected setupMultiplayer(
        playerId: string,
        getPlayerPosition: () => { x: number; y: number },
        otherPlayerFactory: OtherPlayerFactory,
        callbacks: MultiplayerCallbacks = {}
    ) {
        // --- Регистрация локального игрока ---
        const emitPlayerJoin = () => {
            const { x, y } = getPlayerPosition();
            socket.emit('playerJoin', { x, y, name: 'Hero' });
        };
        emitPlayerJoin();

        // --- Очистка старых игроков и слушателей ---
        Object.values(this.otherPlayers).forEach(p => p.destroy());
        this.otherPlayers = {};
        this.clearSocketListeners();

        // --- Слушатель: получение списка текущих игроков ---
        const onCurrentPlayers = (players: PlayerData[]) => {
            Object.values(this.otherPlayers).forEach(p => p.destroy());
            this.otherPlayers = {};
            players.forEach((playerData) => {
                if (playerData.id !== playerId) {
                    this.addOtherPlayer(playerData, otherPlayerFactory, callbacks);
                }
            });
        };
        socket.on('currentPlayers', onCurrentPlayers);
        this.socketListeners.push({ event: 'currentPlayers', handler: onCurrentPlayers });

        // --- Слушатель: новый игрок присоединился ---
        const onPlayerJoined = (playerData: PlayerData) => {
            if (playerData.id !== playerId && !this.otherPlayers[playerData.id]) {
                this.addOtherPlayer(playerData, otherPlayerFactory, callbacks);
            }
        };
        socket.on('playerJoined', onPlayerJoined);
        this.socketListeners.push({ event: 'playerJoined', handler: onPlayerJoined });

        // --- Слушатель: другой игрок переместился ---
        type PlayerMovedData = { id: string; x: number; y: number };
        const onPlayerMoved = (data: PlayerMovedData) => {
            const other = this.otherPlayers[data.id];
            if (other) {
                if (other.setPosition) {
                    other.setPosition(data.x, data.y);
                } else {
                    other.x = data.x;
                    other.y = data.y;
                }
                callbacks.onOtherPlayerMoved?.(data.id, data.x, data.y);
            }
        };
        socket.on('playerMoved', onPlayerMoved);
        this.socketListeners.push({ event: 'playerMoved', handler: onPlayerMoved });

        // --- Слушатель: игрок покинул сцену ---
        const onPlayerLeft = (id: string) => {
            const other = this.otherPlayers[id];
            if (other) {
                other.destroy();
                delete this.otherPlayers[id];
                callbacks.onOtherPlayerRemoved?.(id);
            }
        };
        socket.on('playerLeft', onPlayerLeft);
        this.socketListeners.push({ event: 'playerLeft', handler: onPlayerLeft });
    }

    /**
     * Добавляет другого игрока на сцену через фабрику.
     */
    protected addOtherPlayer(
        playerData: PlayerData,
        factory: OtherPlayerFactory,
        callbacks: MultiplayerCallbacks
    ) {
        const otherPlayer = factory(playerData);
        this.otherPlayers[playerData.id] = otherPlayer;
        callbacks.onOtherPlayerAdded?.(otherPlayer);
    }

    /**
     * Отправляет событие перемещения локального игрока, если координаты изменились.
     */
    protected emitPlayerMove(getPlayerPosition: () => { x: number; y: number }) {
        const { x, y } = getPlayerPosition();
        if (!this.lastSentPlayerPos || this.lastSentPlayerPos.x !== x || this.lastSentPlayerPos.y !== y) {
            socket.emit('playerMove', { x, y });
            this.lastSentPlayerPos = { x, y };
        }
    }

    /**
     * Очищает все зарегистрированные сокет-слушатели для предотвращения утечек.
     */
    protected clearSocketListeners() {
        this.socketListeners.forEach(({ event, handler }) => {
            socket.off(event, handler);
        });
        this.socketListeners = [];
    }
}