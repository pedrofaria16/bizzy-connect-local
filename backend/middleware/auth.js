// Simple auth middleware for local dev: expects header 'x-user-id' with numeric user id
module.exports = function(req, res, next) {
  const header = req.headers['x-user-id'] || req.headers['authorization'];
  let id = null;
  if (header) {
    // allow Authorization: Bearer <id> or raw x-user-id
    const s = String(header);
    if (s.toLowerCase().startsWith('bearer ')) id = s.split(' ')[1];
    else id = s;
  }
  if (!id) return res.status(401).json({ error: 'Unauthorized: user id header missing (x-user-id)' });
  req.userId = Number(id);
  next();
};
