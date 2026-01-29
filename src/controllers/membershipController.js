const Membership = require("../models/membershipModel");

// Create membership subscription
exports.createSubscription = async (req, res) => {
  try {
    const { plan_type, amount, payment_method, transaction_info } = req.body;
    const userId = req.user.id;

    // Check if user already has active membership
    const activeMembership = await Membership.checkActiveMembership(userId);
    if (activeMembership) {
      return res.status(400).json({
        message: "Bạn đã có gói Premium đang hoạt động",
      });
    }

    // Create subscription record
    const subscriptionId = await Membership.create({
      user_id: userId,
      plan_type,
      amount,
      payment_method,
      transaction_info,
    });

    res.status(201).json({
      message:
        "Đơn đăng ký Premium đã được tạo. Đang chờ xác nhận thanh toán...",
      subscriptionId,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({ message: "Lỗi tạo đăng ký Premium" });
  }
};

// Check subscription status (for polling)
exports.checkSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const userId = req.user.id;

    const subscription = await Membership.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: "Không tìm thấy đơn đăng ký" });
    }

    // Security check: only owner can check
    if (subscription.user_id !== userId) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    res.json({
      status: subscription.status,
      expiresAt: subscription.expires_at,
      approvedAt: subscription.approved_at,
    });
  } catch (error) {
    console.error("Check subscription error:", error);
    res.status(500).json({ message: "Lỗi kiểm tra đơn đăng ký" });
  }
};

// Check if user has active membership
exports.checkActiveMembership = async (req, res) => {
  try {
    const userId = req.user.id;
    const membership = await Membership.checkActiveMembership(userId);

    if (membership) {
      res.json({
        isPremium: true,
        expiresAt: membership.expires_at,
        planType: membership.plan_type,
      });
    } else {
      res.json({
        isPremium: false,
      });
    }
  } catch (error) {
    console.error("Check active membership error:", error);
    res.status(500).json({ message: "Lỗi kiểm tra Premium" });
  }
};

// Approve subscription (admin only - for future)
exports.approveSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const subscription = await Membership.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: "Không tìm thấy đơn đăng ký" });
    }

    // Calculate expiry date based on plan
    const now = new Date();
    let expiresAt;

    switch (subscription.plan_type) {
      case "1_month":
        expiresAt = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case "6_month":
        expiresAt = new Date(now.setMonth(now.getMonth() + 6));
        break;
      case "12_month":
        expiresAt = new Date(now.setMonth(now.getMonth() + 12));
        break;
      default:
        expiresAt = new Date(now.setMonth(now.getMonth() + 1));
    }

    await Membership.updateStatus(subscriptionId, "active", expiresAt);

    res.json({
      message: "Đã kích hoạt gói Premium thành công",
      expiresAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi kích hoạt Premium" });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const success = await Membership.cancel(userId);

    if (success) {
      res.json({ message: "Đã hủy gói Premium thành công" });
    } else {
      res
        .status(400)
        .json({ message: "Bạn không có gói Premium nào đang hoạt động" });
    }
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Lỗi hủy gói Premium" });
  }
};
