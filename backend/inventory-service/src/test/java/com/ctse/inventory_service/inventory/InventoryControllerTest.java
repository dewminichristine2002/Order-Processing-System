package com.ctse.inventory_service.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
class InventoryControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc() {
        return MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    void getAllProducts_returnsSeededProducts() throws Exception {
        mockMvc().perform(get("/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].productId").exists());
    }

    @Test
    void reduceStock_updatesQuantity() throws Exception {
        mockMvc().perform(put("/inventory/reduce-stock/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":2,\"orderId\":\"ORDER-1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(1))
                .andExpect(jsonPath("$.changeAmount").value(-2))
                .andExpect(jsonPath("$.newQuantity").value(48));
    }

    @Test
    void reduceStock_insufficientStock_returnsConflict() throws Exception {
        mockMvc().perform(put("/inventory/reduce-stock/2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"quantity\":9999}"))
                .andExpect(status().isConflict());
    }

    @Test
    void updateProduct_updatesFields() throws Exception {
        mockMvc().perform(post("/inventory/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":100,\"productName\":\"Before\",\"stockQuantity\":10,\"price\":10.00}"))
            .andExpect(status().isCreated());

        mockMvc().perform(put("/inventory/products/100")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productName\":\"Updated Name\",\"stockQuantity\":55,\"price\":1234.50}"))
                .andExpect(status().isOk())
            .andExpect(jsonPath("$.productId").value(100))
                .andExpect(jsonPath("$.productName").value("Updated Name"))
                .andExpect(jsonPath("$.stockQuantity").value(55));
    }

    @Test
    void deleteProduct_removesProduct() throws Exception {
        mockMvc().perform(post("/inventory/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"productId\":101,\"productName\":\"To Delete\",\"stockQuantity\":1,\"price\":10.00}"))
            .andExpect(status().isCreated());

        mockMvc().perform(delete("/inventory/products/101"))
            .andExpect(status().isNoContent());

        mockMvc().perform(get("/inventory/101"))
                .andExpect(status().isNotFound());
    }
}
