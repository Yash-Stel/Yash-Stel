/**
 * @On(event = { "CREATE" }, entity = "test_app2Srv.Redemptions")
 * @param {Object} request - User information, tenant-specific CDS model, headers and query parameters
 */
module.exports = async function(request) {
    const { Redemptions, Customers } = cds.entities;

    // Extract the redemption data from the request
    const { redeemedAmount, customer_ID } = request.data;

    if (customer_ID === undefined) {
        request.error(400, "Customer ID must be provided.");
        return;
    }

    // Retrieve the customer's current reward points and redeemed points
    const customer = await SELECT.one.from(Customers)
        .where({ ID: customer_ID });

    if (!customer) {
        request.error(404, `Customer with ID ${customer_ID} not found.`);
        return;
    }

    // Check if the customer has enough reward points to redeem
    if (customer.totalRewardPoints < redeemedAmount) {
        request.error(400, "Insufficient reward points to redeem the specified amount.");
        return;
    }

    // Calculate the new values for totalRewardPoints and totalRedeemedRewardPoints
    const newTotalRewardPoints = customer.totalRewardPoints - redeemedAmount;
    const newTotalRedeemedRewardPoints = customer.totalRedeemedRewardPoints + redeemedAmount;

    // Update the customer's reward points
    await UPDATE(Customers)
        .set({
            totalRewardPoints: newTotalRewardPoints,
            totalRedeemedRewardPoints: newTotalRedeemedRewardPoints
        })
        .where({ ID: customer_ID });
}