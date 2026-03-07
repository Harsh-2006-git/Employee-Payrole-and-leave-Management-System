import CompanyConfig from '../models/CompanyConfig.js';

export const getConfig = async (req, res) => {
    try {
        let config = await CompanyConfig.findOne();
        if (!config) {
            config = await CompanyConfig.create({});
        }
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateConfig = async (req, res) => {
    try {
        let config = await CompanyConfig.findOne();
        if (!config) {
            config = await CompanyConfig.create(req.body);
        } else {
            Object.assign(config, req.body);
            await config.save();
        }
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
