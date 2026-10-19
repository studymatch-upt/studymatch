package com.qs.groupmatcher.controller;

import com.qs.groupmatcher.dto.ProfileResponse;
import com.qs.groupmatcher.dto.QuestionnaireRequest;
import com.qs.groupmatcher.dto.QuestionnaireResponse;
import com.qs.groupmatcher.service.QuestionnaireService;
import com.qs.groupmatcher.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students/{studentId}")
public class StudentProfileController {

    private final QuestionnaireService questionnaireService;
    private final StudentProfileService profileService;

    public StudentProfileController(QuestionnaireService questionnaireService,
                                    StudentProfileService profileService) {
        this.questionnaireService = questionnaireService;
        this.profileService = profileService;
    }

    @PutMapping("/questionnaire")
    public QuestionnaireResponse replaceQuestionnaire(@PathVariable Long studentId,
                                                      @Valid @RequestBody QuestionnaireRequest request) {
        return questionnaireService.replace(studentId, request);
    }

    @GetMapping("/questionnaire")
    public QuestionnaireResponse questionnaire(@PathVariable Long studentId) {
        return questionnaireService.get(studentId);
    }

    @GetMapping("/profile")
    public ProfileResponse profile(@PathVariable Long studentId) {
        return ProfileResponse.from(studentId, profileService.profileOf(studentId));
    }
}
