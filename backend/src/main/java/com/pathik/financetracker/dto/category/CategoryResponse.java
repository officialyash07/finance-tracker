
package com.pathik.financetracker.dto.category;

import com.pathik.financetracker.entity.CategoryType;

import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String code,
        String name,
        CategoryType type,
        boolean active
) {
}
