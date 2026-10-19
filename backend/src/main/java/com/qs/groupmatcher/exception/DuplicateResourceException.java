package com.qs.groupmatcher.exception;

/** Something that must be unique (email, student number) already exists. */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
