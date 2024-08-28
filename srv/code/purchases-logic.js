/**
 * @On(event = { "CREATE" }, entity = "test_app2Srv.Purchases")
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
 */
module.exports = async function(request) {
    const { Purchases, Customers } = cds.entities;

    // Calculate reward points as one tenth of the purchase value
    const rewardPoints = Math.floor(request.data.purchaseValue / 10);
    request.data.rewardPoints = rewardPoints;

    // Retrieve the customer related to the purchase
    if (request.data.customer_ID) {
        const customer = await SELECT.one.from(Customers).where({ ID: request.data.customer_ID });
        if (customer) {
            // Update the total purchase value and total reward points for the customer
            const updatedCustomer = {
                totalPurchaseValue: (customer.totalPurchaseValue || 0) + request.data.purchaseValue,
                totalRewardPoints: (customer.totalRewardPoints || 0) + rewardPoints
            };
            await UPDATE(Customers).set(updatedCustomer).where({ ID: customer.ID });
        }
    }
}