package com.qs.groupmatcher.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Payload for creating or fully updating a student. */
public record StudentRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Pattern(regexp = "[A-Za-z0-9]{1,20}", message = "must be 1-20 letters or digits") String studentNumber,
        @NotNull @Min(1) @Max(5) Integer curricularYear) {
}
