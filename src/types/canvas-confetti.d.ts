declare module 'canvas-confetti' {
    type ConfettiOptions = Record<string, any>;
    function confetti(options?: ConfettiOptions): void;
    export default confetti;
}
