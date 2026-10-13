
package com.pathik.financetracker.mapper;

import com.pathik.financetracker.dto.category.CategoryResponse;
import com.pathik.financetracker.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getCode(),
                category.getName(),
                category.getType(),
                category.isActive()
        );
    }
}
