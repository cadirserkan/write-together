package be.serkan.writetogether.exception;

public class InvalidLoginException extends RuntimeException {

    public InvalidLoginException() {
        super("Gebruikersnaam of wachtwoord klopt niet.");
    }
}
