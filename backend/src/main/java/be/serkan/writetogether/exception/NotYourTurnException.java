package be.serkan.writetogether.exception;

public class NotYourTurnException extends ConflictException {

    public NotYourTurnException() {
        super("Het is niet jouw beurt om te schrijven.");
    }
}
