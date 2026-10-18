package com.qs.groupmatcher.service.profile;

/**
 * The competency dimensions that make up a student profile.
 *
 * <p>Each competency has one onboarding-questionnaire statement, answered on a 1-5 scale.
 * The statements are in Portuguese because they are shown to UPT students in the user interface.
 */
public enum Competency {
    PROGRAMMING("Sinto-me à vontade a resolver problemas através de código."),
    MATHEMATICS_AND_LOGIC("Tenho facilidade em acompanhar raciocínios matemáticos e lógicos."),
    DATABASES("Consigo desenhar as tabelas e escrever as consultas de um sistema simples."),
    DESIGN_AND_UX("Preocupo-me com o aspeto de uma interface e costumo ter ideias para a melhorar."),
    COMMUNICATION("Sinto-me à vontade a escrever relatórios e a fazer apresentações."),
    ORGANISATION_AND_LEADERSHIP("Costumo organizar as tarefas do grupo e cumprir os prazos.");

    private final String questionnaireStatement;

    Competency(String questionnaireStatement) {
        this.questionnaireStatement = questionnaireStatement;
    }

    /** The statement shown to the student in the cold-start questionnaire. */
    public String questionnaireStatement() {
        return questionnaireStatement;
    }
}