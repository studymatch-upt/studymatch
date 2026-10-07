package com.qs.groupmatcher.exception;

/** The request is well-formed but breaks a domain rule (e.g. a non-teacher creating a project). */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
