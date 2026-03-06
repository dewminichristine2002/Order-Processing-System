package com.ctse.inventory_service.inventory;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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
}
