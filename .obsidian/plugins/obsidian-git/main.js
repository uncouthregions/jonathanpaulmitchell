      this.maxExecutionTime = opts.maxExecutionTime || AsyncLock2.DEFAULT_MAX_EXECUTION_TIME;
    AsyncLock2.DEFAULT_MAX_EXECUTION_TIME = 0;
      var executionTimer = null;
        if (executionTimer) {
          clearTimeout(executionTimer);
          executionTimer = null;
        }
        var maxExecutionTime = opts.maxExecutionTime || self3.maxExecutionTime;
        if (maxExecutionTime) {
          executionTimer = setTimeout(function() {
            if (!!self3.queues[key2]) {
              done(locked, new Error("Maximum execution time is exceeded " + key2));
            }
          }, maxExecutionTime);
        }
    var __importDefault = exports && exports.__importDefault || function(mod) {
    var debug_1 = __importDefault(require_browser());
          var Reflect = global2.Reflect;
          module3.exports = Reflect && Reflect.ownKeys || function ownKeys(it) {
async function shasum(buffer2) {
  if (supportsSubtleSHA1 === null) {
    supportsSubtleSHA1 = await testSubtleSHA1();
  }
  return supportsSubtleSHA1 ? subtleSHA1(buffer2) : shasumSync(buffer2);
async function subtleSHA1(buffer2) {
  const hash2 = await crypto.subtle.digest("SHA-1", buffer2);
  return toHex(hash2);
async function testSubtleSHA1() {
  try {
    const hash2 = await subtleSHA1(new Uint8Array([]));
    if (hash2 === "da39a3ee5e6b4b0d3255bfef95601890afd80709")
      return true;
  } catch (_) {
  }
  return false;
  static async from(buffer2) {
    if (Buffer2.isBuffer(buffer2)) {
      return GitIndex.fromBuffer(buffer2);
    } else if (buffer2 === null) {
      return new GitIndex(null);
    } else {
      throw new InternalError("invalid type passed to GitIndex.from");
    }
  static async fromBuffer(buffer2) {
    const shaComputed = await shasum(buffer2.slice(0, -20));
    const shaClaimed = buffer2.slice(-20).toString("hex");
    if (shaClaimed !== shaComputed) {
      throw new InternalError(`Invalid checksum in GitIndex buffer: expected ${shaClaimed} but saw ${shaComputed}`);
    }
    const reader = new BufferCursor(buffer2);
    const _entries = new Map();
    const magic = reader.toString("utf8", 4);
    if (magic !== "DIRC") {
      throw new InternalError(`Inavlid dircache magic file number: ${magic}`);
    }
    const version2 = reader.readUInt32BE();
    if (version2 !== 2) {
      throw new InternalError(`Unsupported dircache version: ${version2}`);
    }
    const numEntries = reader.readUInt32BE();
    let i = 0;
    while (!reader.eof() && i < numEntries) {
      const entry = {};
      entry.ctimeSeconds = reader.readUInt32BE();
      entry.ctimeNanoseconds = reader.readUInt32BE();
      entry.mtimeSeconds = reader.readUInt32BE();
      entry.mtimeNanoseconds = reader.readUInt32BE();
      entry.dev = reader.readUInt32BE();
      entry.ino = reader.readUInt32BE();
      entry.mode = reader.readUInt32BE();
      entry.uid = reader.readUInt32BE();
      entry.gid = reader.readUInt32BE();
      entry.size = reader.readUInt32BE();
      entry.oid = reader.slice(20).toString("hex");
      const flags = reader.readUInt16BE();
      entry.flags = parseCacheEntryFlags(flags);
      const pathlength = buffer2.indexOf(0, reader.tell() + 1) - reader.tell();
      if (pathlength < 1) {
        throw new InternalError(`Got a path length of: ${pathlength}`);
      }
      entry.path = reader.toString("utf8", pathlength);
      if (entry.path.includes("..\\") || entry.path.includes("../")) {
        throw new UnsafeFilepathError(entry.path);
      }
      let padding = 8 - (reader.tell() - 12) % 8;
      if (padding === 0)
        padding = 8;
      while (padding--) {
        const tmp = reader.readUInt8();
        if (tmp !== 0) {
          throw new InternalError(`Expected 1-8 null characters but got '${tmp}' after ${entry.path}`);
        } else if (reader.eof()) {
          throw new InternalError("Unexpected end of file");
        }
      }
      _entries.set(entry.path, entry);
      i++;
    }
    return new GitIndex(_entries);
  async toObject() {
    const header = Buffer2.alloc(12);
    const writer = new BufferCursor(header);
    writer.write("DIRC", 4, "utf8");
    writer.writeUInt32BE(2);
    writer.writeUInt32BE(this.entries.length);
    const body = Buffer2.concat(this.entries.map((entry) => {
      const bpath = Buffer2.from(entry.path);
      const length = Math.ceil((62 + bpath.length + 1) / 8) * 8;
      const written = Buffer2.alloc(length);
      const writer2 = new BufferCursor(written);
      const stat = normalizeStats(entry);
      writer2.writeUInt32BE(stat.ctimeSeconds);
      writer2.writeUInt32BE(stat.ctimeNanoseconds);
      writer2.writeUInt32BE(stat.mtimeSeconds);
      writer2.writeUInt32BE(stat.mtimeNanoseconds);
      writer2.writeUInt32BE(stat.dev);
      writer2.writeUInt32BE(stat.ino);
      writer2.writeUInt32BE(stat.mode);
      writer2.writeUInt32BE(stat.uid);
      writer2.writeUInt32BE(stat.gid);
      writer2.writeUInt32BE(stat.size);
      writer2.write(entry.oid, 20, "hex");
      writer2.writeUInt16BE(renderCacheEntryFlags(entry));
      writer2.write(entry.path, bpath.length, "utf8");
      return written;
    }));
    const main = Buffer2.concat([header, body]);
    const sum = await shasum(main);
    return Buffer2.concat([main, Buffer2.from(sum, "hex")]);
async function updateCachedIndexFile(fs, filepath, cache) {
  const stat = await fs.lstat(filepath);
  const rawIndexFile = await fs.read(filepath);
  const index2 = await GitIndex.from(rawIndexFile);
  cache.map.set(filepath, index2);
  cache.stats.set(filepath, stat);
async function isIndexStale(fs, filepath, cache) {
  const savedStats = cache.stats.get(filepath);
  if (savedStats === void 0)
    return true;
  const currStats = await fs.lstat(filepath);
  if (savedStats === null)
    return false;
  if (currStats === null)
    return false;
  return compareStats(savedStats, currStats);
  static async acquire({ fs, gitdir, cache }, closure) {
    if (!cache[IndexCache])
      cache[IndexCache] = createCache();
    const filepath = `${gitdir}/index`;
    if (lock === null)
      lock = new import_async_lock.default({ maxPending: Infinity });
    let result;
    await lock.acquire(filepath, async () => {
      if (await isIndexStale(fs, filepath, cache[IndexCache])) {
        await updateCachedIndexFile(fs, filepath, cache[IndexCache]);
      }
      const index2 = cache[IndexCache].map.get(filepath);
      result = await closure(index2);
      if (index2._dirty) {
        const buffer2 = await index2.toObject();
        await fs.write(filepath, buffer2);
        cache[IndexCache].stats.set(filepath, await fs.lstat(filepath));
        index2._dirty = false;
      }
    return result;
    this.treePromise = GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      return flatFileListToDirectoryStructure(index2.entries);
      async type() {
        return walker.type(this);
      async mode() {
        return walker.mode(this);
      async stat() {
        return walker.stat(this);
      async content() {
        return walker.content(this);
      async oid() {
        return walker.oid(this);
  async readdir(entry) {
    const filepath = entry._fullpath;
    const tree = await this.treePromise;
    const inode = tree.get(filepath);
    if (!inode)
      return null;
    if (inode.type === "blob")
      return null;
    if (inode.type !== "tree") {
      throw new Error(`ENOTDIR: not a directory, scandir '${filepath}'`);
    }
    const names = inode.children.map((inode2) => inode2.fullpath);
    names.sort(compareStrings);
    return names;
  async type(entry) {
    if (entry._type === false) {
      await entry.stat();
    }
    return entry._type;
  async mode(entry) {
    if (entry._mode === false) {
      await entry.stat();
    }
    return entry._mode;
  async stat(entry) {
    if (entry._stat === false) {
      const tree = await this.treePromise;
      const inode = tree.get(entry._fullpath);
      if (!inode) {
        throw new Error(`ENOENT: no such file or directory, lstat '${entry._fullpath}'`);
      const stats = inode.type === "tree" ? {} : normalizeStats(inode.metadata);
      entry._type = inode.type === "tree" ? "tree" : mode2type(stats.mode);
      entry._mode = stats.mode;
      if (inode.type === "tree") {
        entry._stat = void 0;
      } else {
        entry._stat = stats;
      }
    }
    return entry._stat;
  async content(_entry) {
  async oid(entry) {
    if (entry._oid === false) {
      const tree = await this.treePromise;
      const inode = tree.get(entry._fullpath);
      entry._oid = inode.metadata.oid;
    }
    return entry._oid;
  async get(path2, getall = false) {
    const normalizedPath = normalizePath$1(path2).path;
    const allValues = this.parsedConfig.filter((config) => config.path === normalizedPath).map(({ section, name, value }) => {
      const fn = schema[section] && schema[section][name];
      return fn ? fn(value) : value;
    return getall ? allValues : allValues.pop();
  async getall(path2) {
    return this.get(path2, true);
  async getSubsections(section) {
    return this.parsedConfig.filter((config) => config.section === section && config.isSection).map((config) => config.subsection);
  async deleteSection(section, subsection) {
    this.parsedConfig = this.parsedConfig.filter((config) => !(config.section === section && config.subsection === subsection));
  async append(path2, value) {
    return this.set(path2, value, true);
  async set(path2, value, append3 = false) {
    const {
      section,
      subsection,
      name,
      path: normalizedPath,
      sectionPath
    } = normalizePath$1(path2);
    const configIndex = findLastIndex(this.parsedConfig, (config) => config.path === normalizedPath);
    if (value == null) {
      if (configIndex !== -1) {
        this.parsedConfig.splice(configIndex, 1);
      }
    } else {
      if (configIndex !== -1) {
        const config = this.parsedConfig[configIndex];
        const modifiedConfig = Object.assign({}, config, {
          name,
          value,
          modified: true
        });
        if (append3) {
          this.parsedConfig.splice(configIndex + 1, 0, modifiedConfig);
        } else {
          this.parsedConfig[configIndex] = modifiedConfig;
        const sectionIndex = this.parsedConfig.findIndex((config) => config.path === sectionPath);
        const newConfig = {
          section,
          subsection,
          name,
          value,
          modified: true,
          path: normalizedPath
        };
        if (SECTION_REGEX.test(section) && VARIABLE_NAME_REGEX.test(name)) {
          if (sectionIndex >= 0) {
            this.parsedConfig.splice(sectionIndex + 1, 0, newConfig);
            const newSection = {
              section,
              subsection,
              modified: true,
              path: sectionPath
            };
            this.parsedConfig.push(newSection, newConfig);
    }
  static async get({ fs, gitdir }) {
    const text2 = await fs.read(`${gitdir}/config`, { encoding: "utf8" });
    return GitConfig.from(text2);
  static async save({ fs, gitdir, config }) {
    await fs.write(`${gitdir}/config`, config.toString(), {
      encoding: "utf8"
  static async updateRemoteRefs({
    fs,
    gitdir,
    remote,
    refs,
    symrefs,
    tags,
    refspecs = void 0,
    prune = false,
    pruneTags = false
  }) {
    for (const value of refs.values()) {
      if (!value.match(/[0-9a-f]{40}/)) {
        throw new InvalidOidError(value);
    }
    const config = await GitConfigManager.get({ fs, gitdir });
    if (!refspecs) {
      refspecs = await config.getall(`remote.${remote}.fetch`);
      if (refspecs.length === 0) {
        throw new NoRefspecError(remote);
      }
      refspecs.unshift(`+HEAD:refs/remotes/${remote}/HEAD`);
    }
    const refspec = GitRefSpecSet.from(refspecs);
    const actualRefsToWrite = new Map();
    if (pruneTags) {
      const tags2 = await GitRefManager.listRefs({
        fs,
        gitdir,
        filepath: "refs/tags"
      });
      await GitRefManager.deleteRefs({
        fs,
        gitdir,
        refs: tags2.map((tag2) => `refs/tags/${tag2}`)
      });
    }
    if (tags) {
      for (const serverRef of refs.keys()) {
        if (serverRef.startsWith("refs/tags") && !serverRef.endsWith("^{}")) {
          if (!await GitRefManager.exists({ fs, gitdir, ref: serverRef })) {
            const oid = refs.get(serverRef);
            actualRefsToWrite.set(serverRef, oid);
    }
    const refTranslations = refspec.translate([...refs.keys()]);
    for (const [serverRef, translatedRef] of refTranslations) {
      const value = refs.get(serverRef);
      actualRefsToWrite.set(translatedRef, value);
    }
    const symrefTranslations = refspec.translate([...symrefs.keys()]);
    for (const [serverRef, translatedRef] of symrefTranslations) {
      const value = symrefs.get(serverRef);
      const symtarget = refspec.translateOne(value);
      if (symtarget) {
        actualRefsToWrite.set(translatedRef, `ref: ${symtarget}`);
    }
    const pruned = [];
    if (prune) {
      for (const filepath of refspec.localNamespaces()) {
        const refs2 = (await GitRefManager.listRefs({
          fs,
          gitdir,
          filepath
        })).map((file) => `${filepath}/${file}`);
        for (const ref of refs2) {
          if (!actualRefsToWrite.has(ref)) {
            pruned.push(ref);
      if (pruned.length > 0) {
        await GitRefManager.deleteRefs({ fs, gitdir, refs: pruned });
    }
    for (const [key2, value] of actualRefsToWrite) {
      await fs.write(join(gitdir, key2), `${value.trim()}
`, "utf8");
    }
    return { pruned };
  static async writeRef({ fs, gitdir, ref, value }) {
    if (!value.match(/[0-9a-f]{40}/)) {
      throw new InvalidOidError(value);
    }
    await fs.write(join(gitdir, ref), `${value.trim()}
  static async writeSymbolicRef({ fs, gitdir, ref, value }) {
    await fs.write(join(gitdir, ref), `ref: ${value.trim()}
  static async deleteRef({ fs, gitdir, ref }) {
    return GitRefManager.deleteRefs({ fs, gitdir, refs: [ref] });
  static async deleteRefs({ fs, gitdir, refs }) {
    await Promise.all(refs.map((ref) => fs.rm(join(gitdir, ref))));
    let text2 = await fs.read(`${gitdir}/packed-refs`, { encoding: "utf8" });
    const packed = GitPackedRefs.from(text2);
    const beforeSize = packed.refs.size;
    for (const ref of refs) {
      if (packed.refs.has(ref)) {
        packed.delete(ref);
    }
    if (packed.refs.size < beforeSize) {
      text2 = packed.toString();
      await fs.write(`${gitdir}/packed-refs`, text2, { encoding: "utf8" });
    }
  static async resolve({ fs, gitdir, ref, depth = void 0 }) {
    if (depth !== void 0) {
      depth--;
      if (depth === -1) {
    }
    let sha;
    if (ref.startsWith("ref: ")) {
      ref = ref.slice("ref: ".length);
      return GitRefManager.resolve({ fs, gitdir, ref, depth });
    }
    if (ref.length === 40 && /[0-9a-f]{40}/.test(ref)) {
      return ref;
    }
    const packedMap = await GitRefManager.packedRefs({ fs, gitdir });
    const allpaths = refpaths(ref).filter((p) => !GIT_FILES.includes(p));
    for (const ref2 of allpaths) {
      sha = await fs.read(`${gitdir}/${ref2}`, { encoding: "utf8" }) || packedMap.get(ref2);
      if (sha) {
        return GitRefManager.resolve({ fs, gitdir, ref: sha.trim(), depth });
    }
    throw new NotFoundError(ref);
  static async exists({ fs, gitdir, ref }) {
    try {
      await GitRefManager.expand({ fs, gitdir, ref });
      return true;
    } catch (err) {
      return false;
    }
  static async expand({ fs, gitdir, ref }) {
    if (ref.length === 40 && /[0-9a-f]{40}/.test(ref)) {
      return ref;
    }
    const packedMap = await GitRefManager.packedRefs({ fs, gitdir });
    const allpaths = refpaths(ref);
    for (const ref2 of allpaths) {
      if (await fs.exists(`${gitdir}/${ref2}`))
        return ref2;
      if (packedMap.has(ref2))
        return ref2;
    }
    throw new NotFoundError(ref);
  static async expandAgainstMap({ ref, map }) {
    const allpaths = refpaths(ref);
    for (const ref2 of allpaths) {
      if (await map.has(ref2))
        return ref2;
    }
    throw new NotFoundError(ref);
  static async packedRefs({ fs, gitdir }) {
    const text2 = await fs.read(`${gitdir}/packed-refs`, { encoding: "utf8" });
    const packed = GitPackedRefs.from(text2);
    return packed.refs;
  static async listRefs({ fs, gitdir, filepath }) {
    const packedMap = GitRefManager.packedRefs({ fs, gitdir });
    let files = null;
    try {
      files = await fs.readdirDeep(`${gitdir}/${filepath}`);
      files = files.map((x) => x.replace(`${gitdir}/${filepath}/`, ""));
    } catch (err) {
      files = [];
    }
    for (let key2 of (await packedMap).keys()) {
      if (key2.startsWith(filepath)) {
        key2 = key2.replace(filepath + "/", "");
        if (!files.includes(key2)) {
          files.push(key2);
    }
    files.sort(compareRefNames);
    return files;
  static async listBranches({ fs, gitdir, remote }) {
    if (remote) {
      return GitRefManager.listRefs({
        filepath: `refs/remotes/${remote}`
    } else {
      return GitRefManager.listRefs({ fs, gitdir, filepath: `refs/heads` });
    }
  }
  static async listTags({ fs, gitdir }) {
    const tags = await GitRefManager.listRefs({
      fs,
      gitdir,
      filepath: `refs/tags`
    return tags.filter((x) => !x.endsWith("^{}"));
async function readObjectLoose({ fs, gitdir, oid }) {
  const source = `objects/${oid.slice(0, 2)}/${oid.slice(2)}`;
  const file = await fs.read(`${gitdir}/${source}`);
  if (!file) {
    return null;
  }
  return { object: file, format: "deflated", source };
  async byte() {
    if (this.eof())
      return;
    if (!this.started)
      await this._init();
    if (this.cursor === this.buffer.length) {
      await this._loadnext();
      if (this._ended)
    }
    this._moveCursor(1);
    return this.buffer[this.undoCursor];
  async chunk() {
    if (this.eof())
      return;
    if (!this.started)
      await this._init();
    if (this.cursor === this.buffer.length) {
      await this._loadnext();
      if (this._ended)
    }
    this._moveCursor(this.buffer.length);
    return this.buffer.slice(this.undoCursor, this.cursor);
  async read(n) {
    if (this.eof())
      return;
    if (!this.started)
      await this._init();
    if (this.cursor + n > this.buffer.length) {
      this._trim();
      await this._accumulate(n);
    }
    this._moveCursor(n);
    return this.buffer.slice(this.undoCursor, this.cursor);
  async skip(n) {
    if (this.eof())
      return;
    if (!this.started)
      await this._init();
    if (this.cursor + n > this.buffer.length) {
      this._trim();
      await this._accumulate(n);
    }
    this._moveCursor(n);
  async undo() {
    this.cursor = this.undoCursor;
  async _next() {
    this.started = true;
    let { done, value } = await this.stream.next();
    if (done) {
      this._ended = true;
    }
    if (value) {
      value = Buffer2.from(value);
    }
    return value;
  async _accumulate(n) {
    if (this._ended)
      return;
    const buffers = [this.buffer];
    while (this.cursor + n > lengthBuffers(buffers)) {
      const nextbuffer = await this._next();
        break;
      buffers.push(nextbuffer);
    }
    this.buffer = Buffer2.concat(buffers);
  async _loadnext() {
    this._discardedBytes += this.buffer.length;
    this.undoCursor = 0;
    this.cursor = 0;
    this.buffer = await this._next();
  async _init() {
    this.buffer = await this._next();
async function listpack(stream, onData) {
  const reader = new StreamReader(stream);
  let PACK = await reader.read(4);
  PACK = PACK.toString("utf8");
  if (PACK !== "PACK") {
    throw new InternalError(`Invalid PACK header '${PACK}'`);
  }
  let version2 = await reader.read(4);
  version2 = version2.readUInt32BE(0);
  if (version2 !== 2) {
    throw new InternalError(`Invalid packfile version: ${version2}`);
  }
  let numObjects = await reader.read(4);
  numObjects = numObjects.readUInt32BE(0);
  if (numObjects < 1)
    return;
  while (!reader.eof() && numObjects--) {
    const offset = reader.tell();
    const { type, length, ofs, reference } = await parseHeader(reader);
    const inflator = new import_pako.default.Inflate();
    while (!inflator.result) {
      const chunk = await reader.chunk();
      if (!chunk)
        break;
      inflator.push(chunk, false);
      if (inflator.err) {
        throw new InternalError(`Pako error: ${inflator.msg}`);
      }
      if (inflator.result) {
        if (inflator.result.length !== length) {
          throw new InternalError(`Inflated object size is different from that stated in packfile.`);
        }
        await reader.undo();
        await reader.read(chunk.length - inflator.strm.avail_in);
        const end = reader.tell();
        await onData({
          data: inflator.result,
          type,
          num: numObjects,
          offset,
          end,
          reference,
          ofs
        });
  }
async function parseHeader(reader) {
  let byte = await reader.byte();
  const type = byte >> 4 & 7;
  let length = byte & 15;
  if (byte & 128) {
    let shift = 4;
    do {
      byte = await reader.byte();
      length |= (byte & 127) << shift;
      shift += 7;
    } while (byte & 128);
  }
  let ofs;
  let reference;
  if (type === 6) {
    let shift = 0;
    ofs = 0;
    const bytes = [];
    do {
      byte = await reader.byte();
      ofs |= (byte & 127) << shift;
      shift += 7;
      bytes.push(byte);
    } while (byte & 128);
    reference = Buffer2.from(bytes);
  }
  if (type === 7) {
    const buf = await reader.read(20);
    reference = buf;
  }
  return { type, length, ofs, reference };
async function inflate(buffer2) {
  if (supportsDecompressionStream === null) {
    supportsDecompressionStream = testDecompressionStream();
  }
  return supportsDecompressionStream ? browserInflate(buffer2) : import_pako.default.inflate(buffer2);
async function browserInflate(buffer2) {
  const ds = new DecompressionStream("deflate");
  const d = new Blob([buffer2]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(d).arrayBuffer());
  static async fromIdx({ idx, getExternalRefDelta }) {
    const reader = new BufferCursor(idx);
    const magic = reader.slice(4).toString("hex");
    if (magic !== "ff744f63") {
      return;
    }
    const version2 = reader.readUInt32BE();
    if (version2 !== 2) {
      throw new InternalError(`Unable to read version ${version2} packfile IDX. (Only version 2 supported)`);
    }
    if (idx.byteLength > 2048 * 1024 * 1024) {
      throw new InternalError(`To keep implementation simple, I haven't implemented the layer 5 feature needed to support packfiles > 2GB in size.`);
    }
    reader.seek(reader.tell() + 4 * 255);
    const size = reader.readUInt32BE();
    const hashes = [];
    for (let i = 0; i < size; i++) {
      const hash2 = reader.slice(20).toString("hex");
      hashes[i] = hash2;
    }
    reader.seek(reader.tell() + 4 * size);
    const offsets = new Map();
    for (let i = 0; i < size; i++) {
      offsets.set(hashes[i], reader.readUInt32BE());
    }
    const packfileSha = reader.slice(20).toString("hex");
    return new GitPackIndex({
      hashes,
      crcs: {},
      offsets,
      packfileSha,
      getExternalRefDelta
  static async fromPack({ pack, getExternalRefDelta, onProgress }) {
    const listpackTypes = {
      1: "commit",
      2: "tree",
      3: "blob",
      4: "tag",
      6: "ofs-delta",
      7: "ref-delta"
    };
    const offsetToObject = {};
    const packfileSha = pack.slice(-20).toString("hex");
    const hashes = [];
    const crcs = {};
    const offsets = new Map();
    let totalObjectCount = null;
    let lastPercent = null;
    await listpack([pack], async ({ data, type, reference, offset, num: num2 }) => {
      if (totalObjectCount === null)
        totalObjectCount = num2;
      const percent = Math.floor((totalObjectCount - num2) * 100 / totalObjectCount);
      if (percent !== lastPercent) {
        if (onProgress) {
          await onProgress({
            phase: "Receiving objects",
            loaded: totalObjectCount - num2,
            total: totalObjectCount
          });
      lastPercent = percent;
      type = listpackTypes[type];
      if (["commit", "tree", "blob", "tag"].includes(type)) {
        offsetToObject[offset] = {
          type,
          offset
        };
      } else if (type === "ofs-delta") {
        offsetToObject[offset] = {
          type,
          offset
        };
      } else if (type === "ref-delta") {
        offsetToObject[offset] = {
          type,
          offset
        };
    const offsetArray = Object.keys(offsetToObject).map(Number);
    for (const [i, start] of offsetArray.entries()) {
      const end = i + 1 === offsetArray.length ? pack.byteLength - 20 : offsetArray[i + 1];
      const o = offsetToObject[start];
      const crc = import_crc_32.default.buf(pack.slice(start, end)) >>> 0;
      o.end = end;
      o.crc = crc;
    }
    const p = new GitPackIndex({
      pack: Promise.resolve(pack),
      packfileSha,
      crcs,
      hashes,
      offsets,
      getExternalRefDelta
    lastPercent = null;
    let count = 0;
    const objectsByDepth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let offset in offsetToObject) {
      offset = Number(offset);
      const percent = Math.floor(count * 100 / totalObjectCount);
      if (percent !== lastPercent) {
        if (onProgress) {
          await onProgress({
            phase: "Resolving deltas",
            loaded: count,
            total: totalObjectCount
          });
      count++;
      lastPercent = percent;
      const o = offsetToObject[offset];
      if (o.oid)
        continue;
      try {
        p.readDepth = 0;
        p.externalReadDepth = 0;
        const { type, object } = await p.readSlice({ start: offset });
        objectsByDepth[p.readDepth] += 1;
        const oid = await shasum(GitObject.wrap({ type, object }));
        o.oid = oid;
        hashes.push(oid);
        offsets.set(oid, offset);
        crcs[oid] = o.crc;
      } catch (err) {
        continue;
      }
    }
    hashes.sort();
    return p;
  async toBuffer() {
    const buffers = [];
    const write = (str, encoding) => {
      buffers.push(Buffer2.from(str, encoding));
    };
    write("ff744f63", "hex");
    write("00000002", "hex");
    const fanoutBuffer = new BufferCursor(Buffer2.alloc(256 * 4));
    for (let i = 0; i < 256; i++) {
      let count = 0;
      for (const hash2 of this.hashes) {
        if (parseInt(hash2.slice(0, 2), 16) <= i)
          count++;
      }
      fanoutBuffer.writeUInt32BE(count);
    }
    buffers.push(fanoutBuffer.buffer);
    for (const hash2 of this.hashes) {
      write(hash2, "hex");
    }
    const crcsBuffer = new BufferCursor(Buffer2.alloc(this.hashes.length * 4));
    for (const hash2 of this.hashes) {
      crcsBuffer.writeUInt32BE(this.crcs[hash2]);
    }
    buffers.push(crcsBuffer.buffer);
    const offsetsBuffer = new BufferCursor(Buffer2.alloc(this.hashes.length * 4));
    for (const hash2 of this.hashes) {
      offsetsBuffer.writeUInt32BE(this.offsets.get(hash2));
    }
    buffers.push(offsetsBuffer.buffer);
    write(this.packfileSha, "hex");
    const totalBuffer = Buffer2.concat(buffers);
    const sha = await shasum(totalBuffer);
    const shaBuffer = Buffer2.alloc(20);
    shaBuffer.write(sha, "hex");
    return Buffer2.concat([totalBuffer, shaBuffer]);
  }
  async load({ pack }) {
    this.pack = pack;
  }
  async unload() {
    this.pack = null;
  }
  async read({ oid }) {
    if (!this.offsets.get(oid)) {
      if (this.getExternalRefDelta) {
        this.externalReadDepth++;
        return this.getExternalRefDelta(oid);
      } else {
        throw new InternalError(`Could not read object ${oid} from packfile`);
      }
    }
    const start = this.offsets.get(oid);
    return this.readSlice({ start });
  }
  async readSlice({ start }) {
    if (this.offsetCache[start]) {
      return Object.assign({}, this.offsetCache[start]);
    }
    this.readDepth++;
    const types2 = {
      16: "commit",
      32: "tree",
      48: "blob",
      64: "tag",
      96: "ofs_delta",
      112: "ref_delta"
    };
    if (!this.pack) {
      throw new InternalError("Tried to read from a GitPackIndex with no packfile loaded into memory");
    }
    const raw = (await this.pack).slice(start);
    const reader = new BufferCursor(raw);
    const byte = reader.readUInt8();
    const btype = byte & 112;
    let type = types2[btype];
    if (type === void 0) {
      throw new InternalError("Unrecognized type: 0b" + btype.toString(2));
    }
    const lastFour = byte & 15;
    let length = lastFour;
    const multibyte = byte & 128;
    if (multibyte) {
      length = otherVarIntDecode(reader, lastFour);
    }
    let base = null;
    let object = null;
    if (type === "ofs_delta") {
      const offset = decodeVarInt(reader);
      const baseOffset = start - offset;
      ({ object: base, type } = await this.readSlice({ start: baseOffset }));
    }
    if (type === "ref_delta") {
      const oid = reader.slice(20).toString("hex");
      ({ object: base, type } = await this.read({ oid }));
    }
    const buffer2 = raw.slice(reader.tell());
    object = Buffer2.from(await inflate(buffer2));
    if (object.byteLength !== length) {
      throw new InternalError(`Packfile told us object would have length ${length} but it had length ${object.byteLength}`);
    }
    if (base) {
      object = Buffer2.from(applyDelta(object, base));
    }
    if (this.readDepth > 3) {
      this.offsetCache[start] = { type, object };
    }
    return { type, format: "content", object };
async function loadPackIndex({
  fs,
  filename,
  getExternalRefDelta,
  emitter,
  emitterPrefix
}) {
  const idx = await fs.read(filename);
  return GitPackIndex.fromIdx({ idx, getExternalRefDelta });
async function readObjectPacked({
  fs,
  cache,
  gitdir,
  oid,
  format = "content",
  getExternalRefDelta
}) {
  let list = await fs.readdir(join(gitdir, "objects/pack"));
  list = list.filter((x) => x.endsWith(".idx"));
  for (const filename of list) {
    const indexFile = `${gitdir}/objects/pack/${filename}`;
    const p = await readPackIndex({
      fs,
      cache,
      filename: indexFile,
      getExternalRefDelta
    });
    if (p.error)
      throw new InternalError(p.error);
    if (p.offsets.has(oid)) {
      if (!p.pack) {
        const packFile = indexFile.replace(/idx$/, "pack");
        p.pack = fs.read(packFile);
      const result = await p.read({ oid, getExternalRefDelta });
      result.format = "content";
      result.source = `objects/pack/${filename.replace(/idx$/, "pack")}`;
      return result;
  }
  return null;
async function _readObject({
  fs,
  cache,
  gitdir,
  oid,
  format = "content"
}) {
  const getExternalRefDelta = (oid2) => _readObject({ fs, cache, gitdir, oid: oid2 });
  let result;
  if (oid === "4b825dc642cb6eb9a060e54bf8d69288fbee4904") {
    result = { format: "wrapped", object: Buffer2.from(`tree 0\0`) };
  }
  if (!result) {
    result = await readObjectLoose({ fs, gitdir, oid });
  }
  if (!result) {
    result = await readObjectPacked({
      fs,
      cache,
      gitdir,
      oid,
      getExternalRefDelta
    });
  }
  if (!result) {
    throw new NotFoundError(oid);
  }
  if (format === "deflated") {
    return result;
  }
  if (result.format === "deflated") {
    result.object = Buffer2.from(await inflate(result.object));
    result.format = "wrapped";
  }
  if (result.format === "wrapped") {
    if (format === "wrapped" && result.format === "wrapped") {
    const sha = await shasum(result.object);
    if (sha !== oid) {
      throw new InternalError(`SHA check failed! Expected ${oid}, computed ${sha}`);
    const { object, type } = GitObject.unwrap(result.object);
    result.type = type;
    result.object = object;
    result.format = "content";
  }
  if (result.format === "content") {
    if (format === "content")
      return result;
    return;
  }
  throw new InternalError(`invalid format "${result.format}"`);
  static async sign(tag2, sign, secretKey) {
    const payload = tag2.payload();
    let { signature } = await sign({ payload, secretKey });
    signature = normalizeNewlines(signature);
    const signedTag = payload + signature;
    return GitAnnotatedTag.from(signedTag);
  static async sign(commit2, sign, secretKey) {
    const payload = commit2.withoutSignature();
    const message = GitCommit.justMessage(commit2._commit);
    let { signature } = await sign({ payload, secretKey });
    signature = normalizeNewlines(signature);
    const headers = GitCommit.justHeaders(commit2._commit);
    const signedCommit = headers + "\ngpgsig" + indent(signature) + "\n" + message;
    return GitCommit.from(signedCommit);
async function resolveTree({ fs, cache, gitdir, oid }) {
  if (oid === "4b825dc642cb6eb9a060e54bf8d69288fbee4904") {
    return { tree: GitTree.from([]), oid };
  }
  const { type, object } = await _readObject({ fs, cache, gitdir, oid });
  if (type === "tag") {
    oid = GitAnnotatedTag.from(object).parse().object;
    return resolveTree({ fs, cache, gitdir, oid });
  }
  if (type === "commit") {
    oid = GitCommit.from(object).parse().tree;
    return resolveTree({ fs, cache, gitdir, oid });
  }
  if (type !== "tree") {
    throw new ObjectTypeError(oid, type, "tree");
  }
  return { tree: GitTree.from(object), oid };
    this.mapPromise = (async () => {
        oid = await GitRefManager.resolve({ fs, gitdir, ref });
      const tree = await resolveTree({ fs, cache: this.cache, gitdir, oid });
    })();
      async type() {
        return walker.type(this);
      async mode() {
        return walker.mode(this);
      async stat() {
        return walker.stat(this);
      async content() {
        return walker.content(this);
      async oid() {
        return walker.oid(this);
  async readdir(entry) {
    const filepath = entry._fullpath;
    const { fs, cache, gitdir } = this;
    const map = await this.mapPromise;
    const obj = map.get(filepath);
    if (!obj)
      throw new Error(`No obj for ${filepath}`);
    const oid = obj.oid;
    if (!oid)
      throw new Error(`No oid for obj ${JSON.stringify(obj)}`);
    if (obj.type !== "tree") {
      return null;
    }
    const { type, object } = await _readObject({ fs, cache, gitdir, oid });
    if (type !== obj.type) {
      throw new ObjectTypeError(oid, type, obj.type);
    }
    const tree = GitTree.from(object);
    for (const entry2 of tree) {
      map.set(join(filepath, entry2.path), entry2);
    }
    return tree.entries().map((entry2) => join(filepath, entry2.path));
  async type(entry) {
    if (entry._type === false) {
      const map = await this.mapPromise;
      const { type } = map.get(entry._fullpath);
      entry._type = type;
    }
    return entry._type;
  async mode(entry) {
    if (entry._mode === false) {
      const map = await this.mapPromise;
      const { mode } = map.get(entry._fullpath);
      entry._mode = normalizeMode(parseInt(mode, 8));
    }
    return entry._mode;
  async stat(_entry) {
  async content(entry) {
    if (entry._content === false) {
      const map = await this.mapPromise;
      const { fs, cache, gitdir } = this;
      const obj = map.get(entry._fullpath);
      const oid = obj.oid;
      const { type, object } = await _readObject({ fs, cache, gitdir, oid });
      if (type !== "blob") {
        entry._content = void 0;
      } else {
        entry._content = new Uint8Array(object);
    }
    return entry._content;
  async oid(entry) {
    if (entry._oid === false) {
      const map = await this.mapPromise;
      const obj = map.get(entry._fullpath);
      entry._oid = obj.oid;
    }
    return entry._oid;
      async type() {
        return walker.type(this);
      async mode() {
        return walker.mode(this);
      async stat() {
        return walker.stat(this);
      async content() {
        return walker.content(this);
      async oid() {
        return walker.oid(this);
  async readdir(entry) {
    const filepath = entry._fullpath;
    const { fs, dir } = this;
    const names = await fs.readdir(join(dir, filepath));
    if (names === null)
      return null;
    return names.map((name) => join(filepath, name));
  async type(entry) {
    if (entry._type === false) {
      await entry.stat();
    }
    return entry._type;
  async mode(entry) {
    if (entry._mode === false) {
      await entry.stat();
    }
    return entry._mode;
  async stat(entry) {
    if (entry._stat === false) {
      const { fs, dir } = this;
      let stat = await fs.lstat(`${dir}/${entry._fullpath}`);
      if (!stat) {
        throw new Error(`ENOENT: no such file or directory, lstat '${entry._fullpath}'`);
      let type = stat.isDirectory() ? "tree" : "blob";
      if (type === "blob" && !stat.isFile() && !stat.isSymbolicLink()) {
        type = "special";
      }
      entry._type = type;
      stat = normalizeStats(stat);
      entry._mode = stat.mode;
      if (stat.size === -1 && entry._actualSize) {
        stat.size = entry._actualSize;
      }
      entry._stat = stat;
    }
    return entry._stat;
  async content(entry) {
    if (entry._content === false) {
      const { fs, dir } = this;
      if (await entry.type() === "tree") {
        entry._content = void 0;
      } else {
        const content = await fs.read(`${dir}/${entry._fullpath}`);
        entry._actualSize = content.length;
        if (entry._stat && entry._stat.size === -1) {
          entry._stat.size = entry._actualSize;
        entry._content = new Uint8Array(content);
    }
    return entry._content;
  async oid(entry) {
    if (entry._oid === false) {
      const { fs, gitdir, cache } = this;
      let oid;
      await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
        const stage = index2.entriesMap.get(entry._fullpath);
        const stats = await entry.stat();
        if (!stage || compareStats(stats, stage)) {
          const content = await entry.content();
          if (content === void 0) {
            oid = void 0;
          } else {
            oid = await shasum(GitObject.wrap({ type: "blob", object: await entry.content() }));
            if (stage && oid === stage.oid && stats.mode === stage.mode && compareStats(stats, stage)) {
              index2.insert({
                filepath: entry._fullpath,
                stats,
                oid
              });
          }
        } else {
          oid = stage.oid;
        }
      });
      entry._oid = oid;
    }
    return entry._oid;
  static async isIgnored({ fs, dir, gitdir = join(dir, ".git"), filepath }) {
    if (basename(filepath) === ".git")
      return true;
    if (filepath === ".")
      return false;
    let excludes = "";
    const excludesFile = join(gitdir, "info", "exclude");
    if (await fs.exists(excludesFile)) {
      excludes = await fs.read(excludesFile, "utf8");
    }
    const pairs = [
      {
        gitignore: join(dir, ".gitignore"),
        filepath
    ];
    const pieces = filepath.split("/").filter(Boolean);
    for (let i = 1; i < pieces.length; i++) {
      const folder = pieces.slice(0, i).join("/");
      const file = pieces.slice(i).join("/");
      pairs.push({
        gitignore: join(dir, folder, ".gitignore"),
        filepath: file
      });
    }
    let ignoredStatus = false;
    for (const p of pairs) {
      let file;
      try {
        file = await fs.read(p.gitignore, "utf8");
      } catch (err) {
        if (err.code === "NOENT")
          continue;
      const ign = (0, import_ignore.default)().add(excludes);
      ign.add(file);
      const parentdir = dirname(p.filepath);
      if (parentdir !== "." && ign.ignores(parentdir))
        return true;
      if (ignoredStatus) {
        ignoredStatus = !ign.test(p.filepath).unignored;
      } else {
        ignoredStatus = ign.test(p.filepath).ignored;
      }
    }
    return ignoredStatus;
async function rmRecursive(fs, filepath) {
  const entries = await fs.readdir(filepath);
  if (entries == null) {
    await fs.rm(filepath);
  } else if (entries.length) {
    await Promise.all(entries.map((entry) => {
      const subpath = join(filepath, entry);
      return fs.lstat(subpath).then((stat) => {
        if (!stat)
          return;
        return stat.isDirectory() ? rmRecursive(fs, subpath) : fs.rm(subpath);
      });
    })).then(() => fs.rmdir(filepath));
  } else {
    await fs.rmdir(filepath);
  }
  async exists(filepath, options = {}) {
    try {
      await this._stat(filepath);
      return true;
    } catch (err) {
      if (err.code === "ENOENT" || err.code === "ENOTDIR") {
        return false;
      } else {
        console.log('Unhandled error in "FileSystem.exists()" function', err);
        throw err;
    }
  async read(filepath, options = {}) {
    try {
      let buffer2 = await this._readFile(filepath, options);
      if (typeof buffer2 !== "string") {
        buffer2 = Buffer2.from(buffer2);
      return buffer2;
    } catch (err) {
      return null;
    }
  async write(filepath, contents, options = {}) {
    try {
      await this._writeFile(filepath, contents, options);
      return;
    } catch (err) {
      await this.mkdir(dirname(filepath));
      await this._writeFile(filepath, contents, options);
    }
  async mkdir(filepath, _selfCall = false) {
    try {
      await this._mkdir(filepath);
      return;
    } catch (err) {
      if (err === null)
      if (err.code === "EEXIST")
        return;
      if (_selfCall)
        throw err;
      if (err.code === "ENOENT") {
        const parent = dirname(filepath);
        if (parent === "." || parent === "/" || parent === filepath)
        await this.mkdir(parent);
        await this.mkdir(filepath, true);
    }
  async rm(filepath) {
    try {
      await this._unlink(filepath);
    } catch (err) {
      if (err.code !== "ENOENT")
        throw err;
    }
  async rmdir(filepath, opts) {
    try {
      if (opts && opts.recursive) {
        await this._rm(filepath, opts);
      } else {
        await this._rmdir(filepath);
    } catch (err) {
      if (err.code !== "ENOENT")
        throw err;
    }
  async readdir(filepath) {
    try {
      const names = await this._readdir(filepath);
      names.sort(compareStrings);
      return names;
    } catch (err) {
      if (err.code === "ENOTDIR")
        return null;
      return [];
    }
  async readdirDeep(dir) {
    const subdirs = await this._readdir(dir);
    const files = await Promise.all(subdirs.map(async (subdir) => {
      const res = dir + "/" + subdir;
      return (await this._stat(res)).isDirectory() ? this.readdirDeep(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
  async lstat(filename) {
    try {
      const stats = await this._lstat(filename);
      return stats;
    } catch (err) {
      if (err.code === "ENOENT") {
        return null;
      throw err;
    }
  async readlink(filename, opts = { encoding: "buffer" }) {
    try {
      const link = await this._readlink(filename, opts);
      return Buffer2.isBuffer(link) ? link : Buffer2.from(link);
    } catch (err) {
      if (err.code === "ENOENT") {
        return null;
      throw err;
    }
  async writelink(filename, buffer2) {
    return this._symlink(buffer2.toString("utf8"), filename);
async function writeObjectLoose({ fs, gitdir, object, format, oid }) {
  if (format !== "deflated") {
    throw new InternalError("GitObjectStoreLoose expects objects to write to be in deflated format");
  }
  const source = `objects/${oid.slice(0, 2)}/${oid.slice(2)}`;
  const filepath = `${gitdir}/${source}`;
  if (!await fs.exists(filepath))
    await fs.write(filepath, object);
async function deflate(buffer2) {
  if (supportsCompressionStream === null) {
    supportsCompressionStream = testCompressionStream();
  }
  return supportsCompressionStream ? browserDeflate(buffer2) : import_pako.default.deflate(buffer2);
async function browserDeflate(buffer2) {
  const cs = new CompressionStream("deflate");
  const c = new Blob([buffer2]).stream().pipeThrough(cs);
  return new Uint8Array(await new Response(c).arrayBuffer());
async function _writeObject({
  fs,
  gitdir,
  type,
  object,
  format = "content",
  oid = void 0,
  dryRun = false
}) {
  if (format !== "deflated") {
    if (format !== "wrapped") {
      object = GitObject.wrap({ type, object });
    oid = await shasum(object);
    object = Buffer2.from(await deflate(object));
  }
  if (!dryRun) {
    await writeObjectLoose({ fs, gitdir, object, format: "deflated", oid });
  }
  return oid;
async function add({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  filepath,
  cache = {},
  force = false
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("dir", dir);
    assertParameter("gitdir", gitdir);
    assertParameter("filepath", filepath);
    const fs = new FileSystem(_fs);
    await GitIndexManager.acquire({ fs, gitdir, cache }, async (index2) => {
      return addToIndex({ dir, gitdir, fs, filepath, index: index2, force });
    });
  } catch (err) {
    err.caller = "git.add";
    throw err;
  }
async function addToIndex({ dir, gitdir, fs, filepath, index: index2, force }) {
  filepath = Array.isArray(filepath) ? filepath : [filepath];
  const promises = filepath.map(async (currentFilepath) => {
    if (!force) {
      const ignored = await GitIgnoreManager.isIgnored({
        fs,
        dir,
        gitdir,
        filepath: currentFilepath
      });
      if (ignored)
        return;
    const stats = await fs.lstat(join(dir, currentFilepath));
    if (!stats)
      throw new NotFoundError(currentFilepath);
    if (stats.isDirectory()) {
      const children2 = await fs.readdir(join(dir, currentFilepath));
      const promises2 = children2.map((child) => addToIndex({
        dir,
        gitdir,
        fs,
        filepath: [join(currentFilepath, child)],
        index: index2,
        force
      }));
      await Promise.all(promises2);
    } else {
      const object = stats.isSymbolicLink() ? await fs.readlink(join(dir, currentFilepath)).then(posixifyPathBuffer) : await fs.read(join(dir, currentFilepath));
      if (object === null)
        throw new NotFoundError(currentFilepath);
      const oid = await _writeObject({ fs, gitdir, type: "blob", object });
      index2.insert({ filepath: currentFilepath, stats, oid });
  const settledPromises = await Promise.allSettled(promises);
  const rejectedPromises = settledPromises.filter((settle) => settle.status === "rejected").map((settle) => settle.reason);
  if (rejectedPromises.length > 1) {
    throw new MultipleGitError(rejectedPromises);
  }
  if (rejectedPromises.length === 1) {
    throw rejectedPromises[0];
  }
  const fulfilledPromises = settledPromises.filter((settle) => settle.status === "fulfilled" && settle.value).map((settle) => settle.value);
  return fulfilledPromises;
async function _commit({
  fs,
  cache,
  onSign,
  gitdir,
  message,
  author,
  committer,
  signingKey,
  dryRun = false,
  noUpdateBranch = false,
  ref,
  parent,
  tree
}) {
  if (!ref) {
    ref = await GitRefManager.resolve({
      fs,
      gitdir,
      ref: "HEAD",
      depth: 2
    });
  }
  return GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
    const inodes = flatFileListToDirectoryStructure(index2.entries);
    const inode = inodes.get(".");
    if (!tree) {
      tree = await constructTree({ fs, gitdir, inode, dryRun });
    if (!parent) {
      try {
        parent = [
          await GitRefManager.resolve({
            ref
          })
        ];
      } catch (err) {
        parent = [];
    } else {
      parent = await Promise.all(parent.map((p) => {
        return GitRefManager.resolve({ fs, gitdir, ref: p });
      }));
    let comm = GitCommit.from({
      tree,
      parent,
      author,
      committer,
      message
    });
    if (signingKey) {
      comm = await GitCommit.sign(comm, onSign, signingKey);
    }
    const oid = await _writeObject({
      type: "commit",
      object: comm.toObject(),
    if (!noUpdateBranch && !dryRun) {
      await GitRefManager.writeRef({
        ref,
        value: oid
async function constructTree({ fs, gitdir, inode, dryRun }) {
  const children2 = inode.children;
  for (const inode2 of children2) {
    if (inode2.type === "tree") {
      inode2.metadata.mode = "040000";
      inode2.metadata.oid = await constructTree({ fs, gitdir, inode: inode2, dryRun });
    }
  }
  const entries = children2.map((inode2) => ({
    mode: inode2.metadata.mode,
    path: inode2.basename,
    oid: inode2.metadata.oid,
    type: inode2.type
  }));
  const tree = GitTree.from(entries);
  const oid = await _writeObject({
    type: "tree",
    object: tree.toObject(),
    dryRun
  return oid;
}
async function resolveFilepath({ fs, cache, gitdir, oid, filepath }) {
  if (filepath.startsWith("/")) {
    throw new InvalidFilepathError("leading-slash");
  } else if (filepath.endsWith("/")) {
    throw new InvalidFilepathError("trailing-slash");
  }
  const _oid = oid;
  const result = await resolveTree({ fs, cache, gitdir, oid });
  const tree = result.tree;
  if (filepath === "") {
    oid = result.oid;
  } else {
    const pathArray = filepath.split("/");
    oid = await _resolveFilepath({
      cache,
      tree,
      pathArray,
      oid: _oid,
      filepath
  }
  return oid;
}
async function _resolveFilepath({
  fs,
  cache,
  gitdir,
  tree,
  pathArray,
  oid,
  filepath
}) {
  const name = pathArray.shift();
  for (const entry of tree) {
    if (entry.path === name) {
      if (pathArray.length === 0) {
        return entry.oid;
      } else {
        const { type, object } = await _readObject({
          fs,
          cache,
          gitdir,
          oid: entry.oid
        });
        if (type !== "tree") {
          throw new ObjectTypeError(oid, type, "blob", filepath);
        }
        tree = GitTree.from(object);
        return _resolveFilepath({
          fs,
          cache,
          gitdir,
          tree,
          pathArray,
          oid,
          filepath
        });
      }
    }
  }
  throw new NotFoundError(`file or directory found at "${oid}:${filepath}"`);
}
async function _readTree({
  fs,
  cache,
  gitdir,
  oid,
  filepath = void 0
}) {
  if (filepath !== void 0) {
    oid = await resolveFilepath({ fs, cache, gitdir, oid, filepath });
  }
  const { tree, oid: treeOid } = await resolveTree({ fs, cache, gitdir, oid });
  const result = {
    oid: treeOid,
    tree: tree.entries()
  };
  return result;
}
async function _writeTree({ fs, gitdir, tree }) {
  const object = GitTree.from(tree).toObject();
  const oid = await _writeObject({
    fs,
    gitdir,
    type: "tree",
    object,
    format: "content"
  return oid;
async function _addNote({
  fs,
  cache,
  onSign,
  gitdir,
  ref,
  oid,
  note,
  force,
  author,
  committer,
  signingKey
}) {
  let parent;
  try {
    parent = await GitRefManager.resolve({ gitdir, fs, ref });
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
      throw err;
    }
  }
  const result = await _readTree({
    fs,
    cache,
    gitdir,
    oid: parent || "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
  });
  let tree = result.tree;
  if (force) {
    tree = tree.filter((entry) => entry.path !== oid);
  } else {
    for (const entry of tree) {
      if (entry.path === oid) {
        throw new AlreadyExistsError("note", oid);
      }
    }
  }
  if (typeof note === "string") {
    note = Buffer2.from(note, "utf8");
  }
  const noteOid = await _writeObject({
    fs,
    gitdir,
    type: "blob",
    object: note,
    format: "content"
  });
  tree.push({ mode: "100644", path: oid, oid: noteOid, type: "blob" });
  const treeOid = await _writeTree({
    fs,
    gitdir,
    tree
  });
  const commitOid = await _commit({
    tree: treeOid,
    parent: parent && [parent],
    message: `Note added by 'isomorphic-git addNote'
`,
  });
  return commitOid;
}
async function _getConfig({ fs, gitdir, path: path2 }) {
  const config = await GitConfigManager.get({ fs, gitdir });
  return config.get(path2);
}
async function normalizeAuthorObject({ fs, gitdir, author = {} }) {
  let { name, email, timestamp, timezoneOffset } = author;
  name = name || await _getConfig({ fs, gitdir, path: "user.name" });
  email = email || await _getConfig({ fs, gitdir, path: "user.email" }) || "";
  if (name === void 0) {
    return void 0;
  }
  timestamp = timestamp != null ? timestamp : Math.floor(Date.now() / 1e3);
  timezoneOffset = timezoneOffset != null ? timezoneOffset : new Date(timestamp * 1e3).getTimezoneOffset();
  return { name, email, timestamp, timezoneOffset };
}
async function normalizeCommitterObject({
  fs,
  gitdir,
  author,
  committer
}) {
  committer = Object.assign({}, committer || author);
  if (author) {
    committer.timestamp = committer.timestamp || author.timestamp;
    committer.timezoneOffset = committer.timezoneOffset || author.timezoneOffset;
  }
  committer = await normalizeAuthorObject({ fs, gitdir, author: committer });
  return committer;
}
async function addNote({
  fs: _fs,
  onSign,
  dir,
  gitdir = join(dir, ".git"),
  ref = "refs/notes/commits",
  oid,
  note,
  force,
  author: _author,
  committer: _committer,
  signingKey,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    assertParameter("note", note);
    if (signingKey) {
      assertParameter("onSign", onSign);
    const fs = new FileSystem(_fs);
    const author = await normalizeAuthorObject({ fs, gitdir, author: _author });
    if (!author)
      throw new MissingNameError("author");
    const committer = await normalizeCommitterObject({
      author,
      committer: _committer
    if (!committer)
      throw new MissingNameError("committer");
    return await _addNote({
      fs: new FileSystem(fs),
      oid,
      note,
      force,
  } catch (err) {
    err.caller = "git.addNote";
    throw err;
  }
async function _addRemote({ fs, gitdir, remote, url, force }) {
  if (remote !== import_clean_git_ref.default.clean(remote)) {
    throw new InvalidRefNameError(remote, import_clean_git_ref.default.clean(remote));
  }
  const config = await GitConfigManager.get({ fs, gitdir });
  if (!force) {
    const remoteNames = await config.getSubsections("remote");
    if (remoteNames.includes(remote)) {
      if (url !== await config.get(`remote.${remote}.url`)) {
        throw new AlreadyExistsError("remote", remote);
      }
    }
  }
  await config.set(`remote.${remote}.url`, url);
  await config.set(`remote.${remote}.fetch`, `+refs/heads/*:refs/remotes/${remote}/*`);
  await GitConfigManager.save({ fs, gitdir, config });
async function addRemote({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  remote,
  url,
  force = false
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("remote", remote);
    assertParameter("url", url);
    return await _addRemote({
      fs: new FileSystem(fs),
      gitdir,
      remote,
      url,
      force
    });
  } catch (err) {
    err.caller = "git.addRemote";
    throw err;
  }
async function _annotatedTag({
  fs,
  cache,
  onSign,
  gitdir,
  ref,
  tagger,
  message = ref,
  gpgsig,
  object,
  signingKey,
  force = false
}) {
  ref = ref.startsWith("refs/tags/") ? ref : `refs/tags/${ref}`;
  if (!force && await GitRefManager.exists({ fs, gitdir, ref })) {
    throw new AlreadyExistsError("tag", ref);
  }
  const oid = await GitRefManager.resolve({
    ref: object || "HEAD"
  const { type } = await _readObject({ fs, cache, gitdir, oid });
  let tagObject = GitAnnotatedTag.from({
    object: oid,
    type,
    tag: ref.replace("refs/tags/", ""),
    tagger,
    message,
    gpgsig
  if (signingKey) {
    tagObject = await GitAnnotatedTag.sign(tagObject, onSign, signingKey);
  }
  const value = await _writeObject({
    type: "tag",
    object: tagObject.toObject()
  });
  await GitRefManager.writeRef({ fs, gitdir, ref, value });
}
async function annotatedTag({
  fs: _fs,
  onSign,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  tagger: _tagger,
  message = ref,
  gpgsig,
  object,
  signingKey,
  force = false,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    if (signingKey) {
      assertParameter("onSign", onSign);
    const fs = new FileSystem(_fs);
    const tagger = await normalizeAuthorObject({ fs, gitdir, author: _tagger });
    if (!tagger)
      throw new MissingNameError("tagger");
    return await _annotatedTag({
      cache,
      onSign,
      ref,
      gpgsig,
      object,
      signingKey,
      force
  } catch (err) {
    err.caller = "git.annotatedTag";
    throw err;
  }
}
async function _branch({
  fs,
  gitdir,
  ref,
  object,
  checkout: checkout2 = false,
  force = false
}) {
  if (ref !== import_clean_git_ref.default.clean(ref)) {
    throw new InvalidRefNameError(ref, import_clean_git_ref.default.clean(ref));
  }
  const fullref = `refs/heads/${ref}`;
  if (!force) {
    const exist = await GitRefManager.exists({ fs, gitdir, ref: fullref });
    if (exist) {
      throw new AlreadyExistsError("branch", ref, false);
  }
  let oid;
  try {
    oid = await GitRefManager.resolve({ fs, gitdir, ref: object || "HEAD" });
  } catch (e) {
  }
  if (oid) {
    await GitRefManager.writeRef({ fs, gitdir, ref: fullref, value: oid });
  }
  if (checkout2) {
    await GitRefManager.writeSymbolicRef({
      ref: "HEAD",
      value: fullref
  }
async function branch({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  object,
  checkout: checkout2 = false,
  force = false
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    return await _branch({
      fs: new FileSystem(fs),
      gitdir,
      ref,
      object,
      checkout: checkout2,
      force
    });
  } catch (err) {
    err.caller = "git.branch";
    throw err;
  }
async function _walk({
  fs,
  cache,
  dir,
  gitdir,
  trees,
  map = async (_, entry) => entry,
  reduce = async (parent, children2) => {
    const flatten = flat(children2);
    if (parent !== void 0)
      flatten.unshift(parent);
    return flatten;
  },
  iterate = (walk2, children2) => Promise.all([...children2].map(walk2))
}) {
  const walkers = trees.map((proxy) => proxy[GitWalkSymbol]({ fs, dir, gitdir, cache }));
  const root = new Array(walkers.length).fill(".");
  const range = arrayRange(0, walkers.length);
  const unionWalkerFromReaddir = async (entries) => {
    range.map((i) => {
      entries[i] = entries[i] && new walkers[i].ConstructEntry(entries[i]);
    });
    const subdirs = await Promise.all(range.map((i) => entries[i] ? walkers[i].readdir(entries[i]) : []));
    const iterators = subdirs.map((array) => array === null ? [] : array).map((array) => array[Symbol.iterator]());
    return {
      entries,
      children: unionOfIterators(iterators)
    };
  };
  const walk2 = async (root2) => {
    const { entries, children: children2 } = await unionWalkerFromReaddir(root2);
    const fullpath = entries.find((entry) => entry && entry._fullpath)._fullpath;
    const parent = await map(fullpath, entries);
    if (parent !== null) {
      let walkedChildren = await iterate(walk2, children2);
      walkedChildren = walkedChildren.filter((x) => x !== void 0);
      return reduce(parent, walkedChildren);
    }
  };
  return walk2(root);
async function _checkout({
  fs,
  cache,
  onProgress,
  dir,
  gitdir,
  remote,
  ref,
  filepaths,
  noCheckout,
  noUpdateHead,
  dryRun,
  force,
  track = true
}) {
  let oid;
  try {
    oid = await GitRefManager.resolve({ fs, gitdir, ref });
  } catch (err) {
    if (ref === "HEAD")
      throw err;
    const remoteRef = `${remote}/${ref}`;
    oid = await GitRefManager.resolve({
      fs,
      gitdir,
      ref: remoteRef
    });
    if (track) {
      const config = await GitConfigManager.get({ fs, gitdir });
      await config.set(`branch.${ref}.remote`, remote);
      await config.set(`branch.${ref}.merge`, `refs/heads/${ref}`);
      await GitConfigManager.save({ fs, gitdir, config });
    }
    await GitRefManager.writeRef({
      fs,
      gitdir,
      ref: `refs/heads/${ref}`,
      value: oid
    });
  }
  if (!noCheckout) {
    let ops;
      ops = await analyze({
        cache,
        onProgress,
        dir,
        ref,
        force,
        filepaths
    } catch (err) {
      if (err instanceof NotFoundError && err.data.what === oid) {
        throw new CommitNotFetchedError(ref, oid);
      } else {
        throw err;
    const conflicts2 = ops.filter(([method]) => method === "conflict").map(([method, fullpath]) => fullpath);
    if (conflicts2.length > 0) {
      throw new CheckoutConflictError(conflicts2);
    }
    const errors = ops.filter(([method]) => method === "error").map(([method, fullpath]) => fullpath);
    if (errors.length > 0) {
      throw new InternalError(errors.join(", "));
    }
    if (dryRun) {
      return;
    }
    let count = 0;
    const total = ops.length;
    await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      await Promise.all(ops.filter(([method]) => method === "delete" || method === "delete-index").map(async function([method, fullpath]) {
        const filepath = `${dir}/${fullpath}`;
        if (method === "delete") {
          await fs.rm(filepath);
        }
        index2.delete({ filepath: fullpath });
        if (onProgress) {
          await onProgress({
            phase: "Updating workdir",
            loaded: ++count,
            total
          });
      }));
    });
    await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      for (const [method, fullpath] of ops) {
        if (method === "rmdir" || method === "rmdir-index") {
          const filepath = `${dir}/${fullpath}`;
          try {
            if (method === "rmdir-index") {
            }
            await fs.rmdir(filepath);
            if (onProgress) {
              await onProgress({
                phase: "Updating workdir",
                loaded: ++count,
                total
              });
            }
          } catch (e) {
            if (e.code === "ENOTEMPTY") {
              console.log(`Did not delete ${fullpath} because directory is not empty`);
            } else {
              throw e;
        }
      }
    });
    await Promise.all(ops.filter(([method]) => method === "mkdir" || method === "mkdir-index").map(async function([_, fullpath]) {
      const filepath = `${dir}/${fullpath}`;
      await fs.mkdir(filepath);
      if (onProgress) {
        await onProgress({
          phase: "Updating workdir",
          loaded: ++count,
          total
      }
    }));
    await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      await Promise.all(ops.filter(([method]) => method === "create" || method === "create-index" || method === "update" || method === "mkdir-index").map(async function([method, fullpath, oid2, mode, chmod]) {
        const filepath = `${dir}/${fullpath}`;
        try {
          if (method !== "create-index" && method !== "mkdir-index") {
            const { object } = await _readObject({ fs, cache, gitdir, oid: oid2 });
            if (chmod) {
              await fs.rm(filepath);
            }
            if (mode === 33188) {
              await fs.write(filepath, object);
            } else if (mode === 33261) {
              await fs.write(filepath, object, { mode: 511 });
            } else if (mode === 40960) {
              await fs.writelink(filepath, object);
            } else {
              throw new InternalError(`Invalid mode 0o${mode.toString(8)} detected in blob ${oid2}`);
            }
          }
          const stats = await fs.lstat(filepath);
          if (mode === 33261) {
            stats.mode = 493;
          }
          if (method === "mkdir-index") {
            stats.mode = 57344;
          }
          index2.insert({
            filepath: fullpath,
            stats,
            oid: oid2
          });
            await onProgress({
        } catch (e) {
          console.log(e);
        }
    });
  }
  if (!noUpdateHead) {
    const fullRef = await GitRefManager.expand({ fs, gitdir, ref });
    if (fullRef.startsWith("refs/heads")) {
      await GitRefManager.writeSymbolicRef({
        fs,
        gitdir,
        ref: "HEAD",
        value: fullRef
    } else {
      await GitRefManager.writeRef({ fs, gitdir, ref: "HEAD", value: oid });
  }
async function analyze({
  fs,
  cache,
  onProgress,
  dir,
  gitdir,
  ref,
  force,
  filepaths
}) {
  let count = 0;
  return _walk({
    trees: [TREE({ ref }), WORKDIR(), STAGE()],
    map: async function(fullpath, [commit2, workdir, stage]) {
      if (fullpath === ".")
        return;
      if (filepaths && !filepaths.some((base) => worthWalking(fullpath, base))) {
        return null;
      }
      if (onProgress) {
        await onProgress({ phase: "Analyzing workdir", loaded: ++count });
      }
      const key2 = [!!stage, !!commit2, !!workdir].map(Number).join("");
      switch (key2) {
        case "000":
          return;
        case "001":
          if (force && filepaths && filepaths.includes(fullpath)) {
            return ["delete", fullpath];
          return;
        case "010": {
          switch (await commit2.type()) {
            case "tree": {
              return ["mkdir", fullpath];
            }
            case "blob": {
              return [
                "create",
                fullpath,
                await commit2.oid(),
                await commit2.mode()
              ];
            }
            case "commit": {
              return [
                "mkdir-index",
                fullpath,
                await commit2.oid(),
                await commit2.mode()
              ];
            }
            default: {
              return [
                "error",
                `new entry Unhandled type ${await commit2.type()}`
              ];
            }
        }
        case "011": {
          switch (`${await commit2.type()}-${await workdir.type()}`) {
            case "tree-tree": {
            }
            case "tree-blob":
            case "blob-tree": {
              return ["conflict", fullpath];
            }
            case "blob-blob": {
              if (await commit2.oid() !== await workdir.oid()) {
                if (force) {
                    "update",
                    await commit2.oid(),
                    await commit2.mode(),
                    await commit2.mode() !== await workdir.mode()
                } else {
                  return ["conflict", fullpath];
              } else {
                if (await commit2.mode() !== await workdir.mode()) {
                  if (force) {
                    return [
                      "update",
                      fullpath,
                      await commit2.oid(),
                      await commit2.mode(),
                      true
                    ];
                  } else {
                    return ["conflict", fullpath];
                  }
                } else {
                    "create-index",
                    await commit2.oid(),
                    await commit2.mode()
            case "commit-tree": {
              return;
            }
            case "commit-blob": {
              return ["conflict", fullpath];
            }
            default: {
              return ["error", `new entry Unhandled type ${commit2.type}`];
            }
          }
        }
        case "100": {
          return ["delete-index", fullpath];
        }
        case "101": {
          switch (await stage.type()) {
            case "tree": {
              return ["rmdir", fullpath];
            }
            case "blob": {
              if (await stage.oid() !== await workdir.oid()) {
                if (force) {
                  return ["delete", fullpath];
                } else {
              } else {
                return ["delete", fullpath];
            case "commit": {
              return ["rmdir-index", fullpath];
            default: {
              return [
                "error",
                `delete entry Unhandled type ${await stage.type()}`
              ];
          }
        }
        case "110":
        case "111": {
          switch (`${await stage.type()}-${await commit2.type()}`) {
            case "tree-tree": {
              return;
            }
            case "blob-blob": {
              if (await stage.oid() === await commit2.oid() && await stage.mode() === await commit2.mode() && !force) {
                return;
              }
              if (workdir) {
                if (await workdir.oid() !== await stage.oid() && await workdir.oid() !== await commit2.oid()) {
                  if (force) {
                      await commit2.oid(),
                      await commit2.mode(),
                      await commit2.mode() !== await workdir.mode()
                    return ["conflict", fullpath];
              } else if (force) {
                return [
                  "update",
                  fullpath,
                  await commit2.oid(),
                  await commit2.mode(),
                  await commit2.mode() !== await stage.mode()
                ];
              }
              if (await commit2.mode() !== await stage.mode()) {
                return [
                  "update",
                  fullpath,
                  await commit2.oid(),
                  await commit2.mode(),
                  true
                ];
              }
              if (await commit2.oid() !== await stage.oid()) {
                return [
                  "update",
                  fullpath,
                  await commit2.oid(),
                  await commit2.mode(),
                  false
                ];
              } else {
                return;
            case "tree-blob": {
              return ["update-dir-to-blob", fullpath, await commit2.oid()];
            }
            case "blob-tree": {
              return ["update-blob-to-tree", fullpath];
            }
            case "commit-commit": {
              return [
                "mkdir-index",
                fullpath,
                await commit2.oid(),
                await commit2.mode()
              ];
            }
            default: {
              return [
                "error",
                `update entry Unhandled type ${await stage.type()}-${await commit2.type()}`
              ];
            }
        }
      }
    },
    reduce: async function(parent, children2) {
      children2 = flat(children2);
      if (!parent) {
        return children2;
      } else if (parent && parent[0] === "rmdir") {
        children2.push(parent);
        return children2;
      } else {
        children2.unshift(parent);
        return children2;
async function checkout({
  fs,
  onProgress,
  dir,
  gitdir = join(dir, ".git"),
  remote = "origin",
  ref: _ref,
  filepaths,
  noCheckout = false,
  noUpdateHead = _ref === void 0,
  dryRun = false,
  force = false,
  track = true,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("dir", dir);
    assertParameter("gitdir", gitdir);
    const ref = _ref || "HEAD";
    return await _checkout({
      fs: new FileSystem(fs),
      cache,
      onProgress,
      dir,
      gitdir,
      remote,
      ref,
      filepaths,
      noCheckout,
      noUpdateHead,
      dryRun,
      force,
      track
    });
  } catch (err) {
    err.caller = "git.checkout";
    throw err;
  }
}
async function _currentBranch({
  fs,
  gitdir,
  fullname = false,
  test = false
}) {
  const ref = await GitRefManager.resolve({
    ref: "HEAD",
    depth: 2
  if (test) {
    try {
      await GitRefManager.resolve({ fs, gitdir, ref });
    } catch (_) {
      return;
    }
  }
  if (!ref.startsWith("refs/"))
    return;
  return fullname ? ref : abbreviateRef(ref);
async function forAwait(iterable, cb) {
  const iter = getIterator(iterable);
  while (true) {
    const { value, done } = await iter.next();
    if (value)
      await cb(value);
    if (done)
      break;
  }
  if (iter.return)
    iter.return();
async function collect(iterable) {
  let size = 0;
  const buffers = [];
  await forAwait(iterable, (value) => {
    buffers.push(value);
    size += value.byteLength;
  const result = new Uint8Array(size);
  let nextIndex = 0;
  for (const buffer2 of buffers) {
    result.set(buffer2, nextIndex);
    nextIndex += buffer2.byteLength;
  }
  return result;
    return async function read() {
      try {
        let length = await reader.read(4);
        if (length == null)
        length = parseInt(length.toString("utf8"), 16);
        if (length === 0)
          return null;
        if (length === 1)
          return null;
        const buffer2 = await reader.read(length - 4);
        if (buffer2 == null)
          return true;
        return buffer2;
      } catch (err) {
        console.log("error", err);
        return true;
      }
async function parseCapabilitiesV2(read) {
  const capabilities2 = {};
  let line;
  while (true) {
    line = await read();
    if (line === true)
      break;
    if (line === null)
      continue;
    line = line.toString("utf8").replace(/\n$/, "");
    const i = line.indexOf("=");
    if (i > -1) {
      const key2 = line.slice(0, i);
      const value = line.slice(i + 1);
      capabilities2[key2] = value;
    } else {
      capabilities2[line] = true;
    }
  }
  return { protocolVersion: 2, capabilities2 };
}
async function parseRefsAdResponse(stream, { service }) {
  const capabilities = new Set();
  const refs = new Map();
  const symrefs = new Map();
  const read = GitPktLine.streamReader(stream);
  let lineOne = await read();
  while (lineOne === null)
    lineOne = await read();
  if (lineOne === true)
    throw new EmptyServerResponseError();
  if (lineOne.includes("version 2")) {
    return parseCapabilitiesV2(read);
  }
  if (lineOne.toString("utf8").replace(/\n$/, "") !== `# service=${service}`) {
    throw new ParseError(`# service=${service}\\n`, lineOne.toString("utf8"));
  }
  let lineTwo = await read();
  while (lineTwo === null)
    lineTwo = await read();
  if (lineTwo === true)
    return { capabilities, refs, symrefs };
  lineTwo = lineTwo.toString("utf8");
  if (lineTwo.includes("version 2")) {
    return parseCapabilitiesV2(read);
  }
  const [firstRef, capabilitiesLine] = splitAndAssert(lineTwo, "\0", "\\x00");
  capabilitiesLine.split(" ").map((x) => capabilities.add(x));
  const [ref, name] = splitAndAssert(firstRef, " ", " ");
  refs.set(name, ref);
  while (true) {
    const line = await read();
    if (line === true)
      break;
    if (line !== null) {
      const [ref2, name2] = splitAndAssert(line.toString("utf8"), " ", " ");
      refs.set(name2, ref2);
  }
  for (const cap of capabilities) {
    if (cap.startsWith("symref=")) {
      const m = cap.match(/symref=([^:]+):(.*)/);
      if (m.length === 3) {
        symrefs.set(m[1], m[2]);
  }
  return { protocolVersion: 1, capabilities, refs, symrefs };
var stringifyBody = async (res) => {
    const data = Buffer2.from(await collect(res.body));
};
  static async capabilities() {
    return ["discover", "connect"];
  static async discover({
    http,
    onProgress,
    onAuth,
    onAuthSuccess,
    onAuthFailure,
    corsProxy,
    service,
    url: _origUrl,
    headers,
    protocolVersion
  }) {
    let { url, auth } = extractAuthFromUrl(_origUrl);
    const proxifiedURL = corsProxy ? corsProxify(corsProxy, url) : url;
    if (auth.username || auth.password) {
      headers.Authorization = calculateBasicAuthHeader(auth);
    }
    if (protocolVersion === 2) {
      headers["Git-Protocol"] = "version=2";
    }
    let res;
    let tryAgain;
    let providedAuthBefore = false;
    do {
      res = await http.request({
        onProgress,
        method: "GET",
        url: `${proxifiedURL}/info/refs?service=${service}`,
        headers
      });
      tryAgain = false;
      if (res.statusCode === 401 || res.statusCode === 203) {
        const getAuth = providedAuthBefore ? onAuthFailure : onAuth;
        if (getAuth) {
          auth = await getAuth(url, {
            ...auth,
            headers: { ...headers }
          });
          if (auth && auth.cancel) {
            throw new UserCanceledError();
          } else if (auth) {
            updateHeaders(headers, auth);
            providedAuthBefore = true;
            tryAgain = true;
      } else if (res.statusCode === 200 && providedAuthBefore && onAuthSuccess) {
        await onAuthSuccess(url, auth);
    } while (tryAgain);
    if (res.statusCode !== 200) {
      const { response } = await stringifyBody(res);
      throw new HttpError(res.statusCode, res.statusMessage, response);
    }
    if (res.headers["content-type"] === `application/x-${service}-advertisement`) {
      const remoteHTTP = await parseRefsAdResponse(res.body, { service });
      remoteHTTP.auth = auth;
      return remoteHTTP;
    } else {
      const { preview, response, data } = await stringifyBody(res);
      try {
        const remoteHTTP = await parseRefsAdResponse([data], { service });
      } catch (e) {
        throw new SmartHttpError(preview, response);
    }
  static async connect({
    http,
    onProgress,
    corsProxy,
    service,
    url,
    auth,
    body,
    headers
  }) {
    const urlAuth = extractAuthFromUrl(url);
    if (urlAuth)
      url = urlAuth.url;
    if (corsProxy)
      url = corsProxify(corsProxy, url);
    headers["content-type"] = `application/x-${service}-request`;
    headers.accept = `application/x-${service}-result`;
    updateHeaders(headers, auth);
    const res = await http.request({
      method: "POST",
      url: `${url}/${service}`,
    if (res.statusCode !== 200) {
      const { response } = stringifyBody(res);
      throw new HttpError(res.statusCode, res.statusMessage, response);
    }
    return res;
  static async read({ fs, gitdir }) {
    if (lock$1 === null)
      lock$1 = new import_async_lock.default();
    const filepath = join(gitdir, "shallow");
    const oids = new Set();
    await lock$1.acquire(filepath, async function() {
      const text2 = await fs.read(filepath, { encoding: "utf8" });
      if (text2 === null)
        return oids;
      if (text2.trim() === "")
        return oids;
      text2.trim().split("\n").map((oid) => oids.add(oid));
    });
    return oids;
  }
  static async write({ fs, gitdir, oids }) {
    if (lock$1 === null)
      lock$1 = new import_async_lock.default();
    const filepath = join(gitdir, "shallow");
    if (oids.size > 0) {
      const text2 = [...oids].join("\n") + "\n";
      await lock$1.acquire(filepath, async function() {
        await fs.write(filepath, text2, {
          encoding: "utf8"
    } else {
      await lock$1.acquire(filepath, async function() {
        await fs.rm(filepath);
      });
    }
  }
};
async function hasObjectLoose({ fs, gitdir, oid }) {
  const source = `objects/${oid.slice(0, 2)}/${oid.slice(2)}`;
  return fs.exists(`${gitdir}/${source}`);
}
async function hasObjectPacked({
  fs,
  cache,
  gitdir,
  oid,
  getExternalRefDelta
}) {
  let list = await fs.readdir(join(gitdir, "objects/pack"));
  list = list.filter((x) => x.endsWith(".idx"));
  for (const filename of list) {
    const indexFile = `${gitdir}/objects/pack/${filename}`;
    const p = await readPackIndex({
      fs,
      cache,
      filename: indexFile,
      getExternalRefDelta
    if (p.error)
      throw new InternalError(p.error);
    if (p.offsets.has(oid)) {
      return true;
    }
  return false;
}
async function hasObject({
  fs,
  cache,
  gitdir,
  oid,
  format = "content"
}) {
  const getExternalRefDelta = (oid2) => _readObject({ fs, cache, gitdir, oid: oid2 });
  let result = await hasObjectLoose({ fs, gitdir, oid });
  if (!result) {
    result = await hasObjectPacked({
      fs,
      cache,
      gitdir,
      oid,
      getExternalRefDelta
  return result;
}
function emptyPackfile(pack) {
  const pheader = "5041434b";
  const version2 = "00000002";
  const obCount = "00000000";
  const header = pheader + version2 + obCount;
  return pack.slice(0, 12).toString("hex") === header;
}
function filterCapabilities(server, client) {
  const serverNames = server.map((cap) => cap.split("=", 1)[0]);
  return client.filter((cap) => {
    const name = cap.split("=", 1)[0];
    return serverNames.includes(name);
  async next() {
    if (this._queue.length > 0) {
      return { value: this._queue.shift() };
    }
    if (this._ended) {
      return { done: true };
    }
    if (this._waiting) {
      throw Error("You cannot call read until the previous call to read has returned!");
    }
    return new Promise((resolve) => {
      this._waiting = resolve;
  (async () => {
    await forAwait(input, (chunk) => {
  })();
    const nextBit = async function() {
      const line = await read();
      if (line === null)
        return nextBit();
      if (line === true) {
        packetlines.end();
        progress.end();
        packfile.end();
        return;
      }
      switch (line[0]) {
        case 1: {
          packfile.write(line.slice(1));
          break;
        }
        case 2: {
          progress.write(line.slice(1));
          break;
        }
        case 3: {
          const error = line.slice(1);
          progress.write(error);
          packfile.destroy(new Error(error.toString("utf8")));
        default: {
          packetlines.write(line.slice(0));
      }
      nextBit();
async function parseUploadPackResponse(stream) {
  const { packetlines, packfile, progress } = GitSideBand.demux(stream);
  const shallows = [];
  const unshallows = [];
  const acks = [];
  let nak = false;
  let done = false;
  return new Promise((resolve, reject) => {
    forAwait(packetlines, (data) => {
      const line = data.toString("utf8").trim();
      if (line.startsWith("shallow")) {
        const oid = line.slice(-41).trim();
        if (oid.length !== 40) {
          reject(new InvalidOidError(oid));
        }
        shallows.push(oid);
      } else if (line.startsWith("unshallow")) {
        const oid = line.slice(-41).trim();
        if (oid.length !== 40) {
          reject(new InvalidOidError(oid));
        }
        unshallows.push(oid);
      } else if (line.startsWith("ACK")) {
        const [, oid, status2] = line.split(" ");
        acks.push({ oid, status: status2 });
        if (!status2)
      } else if (line.startsWith("NAK")) {
        nak = true;
        done = true;
      }
      if (done) {
        resolve({ shallows, unshallows, acks, nak, packfile, progress });
      }
async function _fetch({
  fs,
  cache,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  gitdir,
  ref: _ref,
  remoteRef: _remoteRef,
  remote: _remote,
  url: _url,
  corsProxy,
  depth = null,
  since = null,
  exclude = [],
  relative = false,
  tags = false,
  singleBranch = false,
  headers = {},
  prune = false,
  pruneTags = false
}) {
  const ref = _ref || await _currentBranch({ fs, gitdir, test: true });
  const config = await GitConfigManager.get({ fs, gitdir });
  const remote = _remote || ref && await config.get(`branch.${ref}.remote`) || "origin";
  const url = _url || await config.get(`remote.${remote}.url`);
  if (typeof url === "undefined") {
    throw new MissingParameterError("remote OR url");
  }
  const remoteRef = _remoteRef || ref && await config.get(`branch.${ref}.merge`) || _ref || "HEAD";
  if (corsProxy === void 0) {
    corsProxy = await config.get("http.corsProxy");
  }
  const GitRemoteHTTP2 = GitRemoteManager.getRemoteHelperFor({ url });
  const remoteHTTP = await GitRemoteHTTP2.discover({
    service: "git-upload-pack",
    url,
    headers,
    protocolVersion: 1
  });
  const auth = remoteHTTP.auth;
  const remoteRefs = remoteHTTP.refs;
  if (remoteRefs.size === 0) {
    return {
      defaultBranch: null,
      fetchHead: null,
      fetchHeadDescription: null
    };
  }
  if (depth !== null && !remoteHTTP.capabilities.has("shallow")) {
    throw new RemoteCapabilityError("shallow", "depth");
  }
  if (since !== null && !remoteHTTP.capabilities.has("deepen-since")) {
    throw new RemoteCapabilityError("deepen-since", "since");
  }
  if (exclude.length > 0 && !remoteHTTP.capabilities.has("deepen-not")) {
    throw new RemoteCapabilityError("deepen-not", "exclude");
  }
  if (relative === true && !remoteHTTP.capabilities.has("deepen-relative")) {
    throw new RemoteCapabilityError("deepen-relative", "relative");
  }
  const { oid, fullref } = GitRefManager.resolveAgainstMap({
    ref: remoteRef,
    map: remoteRefs
  });
  for (const remoteRef2 of remoteRefs.keys()) {
    if (remoteRef2 === fullref || remoteRef2 === "HEAD" || remoteRef2.startsWith("refs/heads/") || tags && remoteRef2.startsWith("refs/tags/")) {
      continue;
    remoteRefs.delete(remoteRef2);
  }
  const capabilities = filterCapabilities([...remoteHTTP.capabilities], [
    "multi_ack_detailed",
    "no-done",
    "side-band-64k",
    "ofs-delta",
    `agent=${pkg.agent}`
  ]);
  if (relative)
    capabilities.push("deepen-relative");
  const wants = singleBranch ? [oid] : remoteRefs.values();
  const haveRefs = singleBranch ? [ref] : await GitRefManager.listRefs({
    fs,
    gitdir,
    filepath: `refs`
  });
  let haves = [];
  for (let ref2 of haveRefs) {
    try {
      ref2 = await GitRefManager.expand({ fs, gitdir, ref: ref2 });
      const oid2 = await GitRefManager.resolve({ fs, gitdir, ref: ref2 });
      if (await hasObject({ fs, cache, gitdir, oid: oid2 })) {
        haves.push(oid2);
      }
    } catch (err) {
  }
  haves = [...new Set(haves)];
  const oids = await GitShallowManager.read({ fs, gitdir });
  const shallows = remoteHTTP.capabilities.has("shallow") ? [...oids] : [];
  const packstream = writeUploadPackRequest({
    capabilities,
    wants,
    haves,
    shallows,
    depth,
    since,
    exclude
  });
  const packbuffer = Buffer2.from(await collect(packstream));
  const raw = await GitRemoteHTTP2.connect({
    http,
    onProgress,
    corsProxy,
    service: "git-upload-pack",
    url,
    auth,
    body: [packbuffer],
    headers
  });
  const response = await parseUploadPackResponse(raw.body);
  if (raw.headers) {
    response.headers = raw.headers;
  }
  for (const oid2 of response.shallows) {
    if (!oids.has(oid2)) {
      try {
        const { object } = await _readObject({ fs, cache, gitdir, oid: oid2 });
        const commit2 = new GitCommit(object);
        const hasParents = await Promise.all(commit2.headers().parent.map((oid3) => hasObject({ fs, cache, gitdir, oid: oid3 })));
        const haveAllParents = hasParents.length === 0 || hasParents.every((has) => has);
        if (!haveAllParents) {
          oids.add(oid2);
        }
      } catch (err) {
        oids.add(oid2);
      }
  }
  for (const oid2 of response.unshallows) {
    oids.delete(oid2);
  }
  await GitShallowManager.write({ fs, gitdir, oids });
  if (singleBranch) {
    const refs = new Map([[fullref, oid]]);
    const symrefs = new Map();
    let bail = 10;
    let key2 = fullref;
    while (bail--) {
      const value = remoteHTTP.symrefs.get(key2);
      if (value === void 0)
        break;
      symrefs.set(key2, value);
      key2 = value;
    const realRef = remoteRefs.get(key2);
    if (realRef) {
      refs.set(key2, realRef);
    const { pruned } = await GitRefManager.updateRemoteRefs({
      fs,
      gitdir,
      remote,
      refs,
      symrefs,
      tags,
      prune
    if (prune) {
      response.pruned = pruned;
  } else {
    const { pruned } = await GitRefManager.updateRemoteRefs({
      remote,
      refs: remoteRefs,
      symrefs: remoteHTTP.symrefs,
      tags,
      prune,
      pruneTags
    if (prune) {
      response.pruned = pruned;
  }
  response.HEAD = remoteHTTP.symrefs.get("HEAD");
  if (response.HEAD === void 0) {
    const { oid: oid2 } = GitRefManager.resolveAgainstMap({
      ref: "HEAD",
      map: remoteRefs
    for (const [key2, value] of remoteRefs.entries()) {
      if (key2 !== "HEAD" && value === oid2) {
        response.HEAD = key2;
        break;
  }
  const noun = fullref.startsWith("refs/tags") ? "tag" : "branch";
  response.FETCH_HEAD = {
    oid,
    description: `${noun} '${abbreviateRef(fullref)}' of ${url}`
  };
  if (onProgress || onMessage) {
    const lines = splitLines(response.progress);
    forAwait(lines, async (line) => {
      if (onMessage)
        await onMessage(line);
      if (onProgress) {
        const matches = line.match(/([^:]*).*\((\d+?)\/(\d+?)\)/);
        if (matches) {
          await onProgress({
            phase: matches[1].trim(),
            loaded: parseInt(matches[2], 10),
            total: parseInt(matches[3], 10)
          });
    });
  }
  const packfile = Buffer2.from(await collect(response.packfile));
  const packfileSha = packfile.slice(-20).toString("hex");
  const res = {
    defaultBranch: response.HEAD,
    fetchHead: response.FETCH_HEAD.oid,
    fetchHeadDescription: response.FETCH_HEAD.description
  };
  if (response.headers) {
    res.headers = response.headers;
  }
  if (prune) {
    res.pruned = response.pruned;
  }
  if (packfileSha !== "" && !emptyPackfile(packfile)) {
    res.packfile = `objects/pack/pack-${packfileSha}.pack`;
    const fullpath = join(gitdir, res.packfile);
    await fs.write(fullpath, packfile);
    const getExternalRefDelta = (oid2) => _readObject({ fs, cache, gitdir, oid: oid2 });
    const idx = await GitPackIndex.fromPack({
      pack: packfile,
      getExternalRefDelta,
      onProgress
    });
    await fs.write(fullpath.replace(/\.pack$/, ".idx"), await idx.toBuffer());
  }
  return res;
async function _init({
  fs,
  bare = false,
  dir,
  gitdir = bare ? dir : join(dir, ".git"),
  defaultBranch = "master"
}) {
  if (await fs.exists(gitdir + "/config"))
    return;
  let folders = [
    "hooks",
    "info",
    "objects/info",
    "objects/pack",
    "refs/heads",
    "refs/tags"
  ];
  folders = folders.map((dir2) => gitdir + "/" + dir2);
  for (const folder of folders) {
    await fs.mkdir(folder);
  }
  await fs.write(gitdir + "/config", `[core]
  await fs.write(gitdir + "/HEAD", `ref: refs/heads/${defaultBranch}
async function _clone({
  fs,
  cache,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir,
  url,
  corsProxy,
  ref,
  remote,
  depth,
  since,
  exclude,
  relative,
  singleBranch,
  noCheckout,
  noTags,
  headers
}) {
  try {
    await _init({ fs, gitdir });
    await _addRemote({ fs, gitdir, remote, url, force: false });
    if (corsProxy) {
      const config = await GitConfigManager.get({ fs, gitdir });
      await config.set(`http.corsProxy`, corsProxy);
      await GitConfigManager.save({ fs, gitdir, config });
    }
    const { defaultBranch, fetchHead } = await _fetch({
      fs,
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      gitdir,
      ref,
      remote,
      corsProxy,
      depth,
      since,
      exclude,
      relative,
      singleBranch,
      headers,
      tags: !noTags
    });
    if (fetchHead === null)
      return;
    ref = ref || defaultBranch;
    ref = ref.replace("refs/heads/", "");
    await _checkout({
      fs,
      cache,
      onProgress,
      dir,
      gitdir,
      ref,
      remote,
      noCheckout
    });
  } catch (err) {
    await fs.rmdir(gitdir, { recursive: true, maxRetries: 10 }).catch(() => void 0);
    throw err;
  }
async function clone({
  fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, ".git"),
  url,
  corsProxy = void 0,
  ref = void 0,
  remote = "origin",
  depth = void 0,
  since = void 0,
  exclude = [],
  relative = false,
  singleBranch = false,
  noCheckout = false,
  noTags = false,
  headers = {},
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("http", http);
    assertParameter("gitdir", gitdir);
    if (!noCheckout) {
      assertParameter("dir", dir);
    assertParameter("url", url);
    return await _clone({
      fs: new FileSystem(fs),
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      dir,
      gitdir,
      url,
      corsProxy,
      ref,
      remote,
      depth,
      since,
      exclude,
      relative,
      singleBranch,
      noCheckout,
      noTags,
      headers
    });
  } catch (err) {
    err.caller = "git.clone";
    throw err;
  }
async function commit({
  fs: _fs,
  onSign,
  dir,
  gitdir = join(dir, ".git"),
  message,
  author: _author,
  committer: _committer,
  signingKey,
  dryRun = false,
  noUpdateBranch = false,
  ref,
  parent,
  tree,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("message", message);
    if (signingKey) {
      assertParameter("onSign", onSign);
    const fs = new FileSystem(_fs);
    const author = await normalizeAuthorObject({ fs, gitdir, author: _author });
    if (!author)
      throw new MissingNameError("author");
    const committer = await normalizeCommitterObject({
      fs,
      gitdir,
      author,
      committer: _committer
    });
    if (!committer)
      throw new MissingNameError("committer");
    return await _commit({
      fs,
      cache,
      onSign,
      gitdir,
      message,
      author,
      committer,
      signingKey,
      dryRun,
      noUpdateBranch,
      ref,
      parent,
      tree
    });
  } catch (err) {
    err.caller = "git.commit";
    throw err;
  }
async function currentBranch({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  fullname = false,
  test = false
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    return await _currentBranch({
      fs: new FileSystem(fs),
      gitdir,
      fullname,
      test
    });
  } catch (err) {
    err.caller = "git.currentBranch";
    throw err;
  }
async function _deleteBranch({ fs, gitdir, ref }) {
  const exist = await GitRefManager.exists({ fs, gitdir, ref });
  if (!exist) {
    throw new NotFoundError(ref);
  }
  const fullRef = await GitRefManager.expand({ fs, gitdir, ref });
  const currentRef = await _currentBranch({ fs, gitdir, fullname: true });
  if (fullRef === currentRef) {
    const value = await GitRefManager.resolve({ fs, gitdir, ref: fullRef });
    await GitRefManager.writeRef({ fs, gitdir, ref: "HEAD", value });
  }
  await GitRefManager.deleteRef({ fs, gitdir, ref: fullRef });
async function deleteBranch({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  ref
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("ref", ref);
    return await _deleteBranch({
      fs: new FileSystem(fs),
      gitdir,
      ref
    });
  } catch (err) {
    err.caller = "git.deleteBranch";
    throw err;
  }
async function deleteRef({ fs, dir, gitdir = join(dir, ".git"), ref }) {
  try {
    assertParameter("fs", fs);
    assertParameter("ref", ref);
    await GitRefManager.deleteRef({ fs: new FileSystem(fs), gitdir, ref });
  } catch (err) {
    err.caller = "git.deleteRef";
    throw err;
  }
async function _deleteRemote({ fs, gitdir, remote }) {
  const config = await GitConfigManager.get({ fs, gitdir });
  await config.deleteSection("remote", remote);
  await GitConfigManager.save({ fs, gitdir, config });
async function deleteRemote({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  remote
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("remote", remote);
    return await _deleteRemote({
      fs: new FileSystem(fs),
      gitdir,
      remote
    });
  } catch (err) {
    err.caller = "git.deleteRemote";
    throw err;
  }
async function _deleteTag({ fs, gitdir, ref }) {
  ref = ref.startsWith("refs/tags/") ? ref : `refs/tags/${ref}`;
  await GitRefManager.deleteRef({ fs, gitdir, ref });
async function deleteTag({ fs, dir, gitdir = join(dir, ".git"), ref }) {
  try {
    assertParameter("fs", fs);
    assertParameter("ref", ref);
    return await _deleteTag({
      fs: new FileSystem(fs),
      gitdir,
      ref
    });
  } catch (err) {
    err.caller = "git.deleteTag";
    throw err;
  }
async function expandOidLoose({ fs, gitdir, oid: short }) {
  const prefix = short.slice(0, 2);
  const objectsSuffixes = await fs.readdir(`${gitdir}/objects/${prefix}`);
  return objectsSuffixes.map((suffix) => `${prefix}${suffix}`).filter((_oid) => _oid.startsWith(short));
}
async function expandOidPacked({
  fs,
  cache,
  gitdir,
  oid: short,
  getExternalRefDelta
}) {
  const results = [];
  let list = await fs.readdir(join(gitdir, "objects/pack"));
  list = list.filter((x) => x.endsWith(".idx"));
  for (const filename of list) {
    const indexFile = `${gitdir}/objects/pack/${filename}`;
    const p = await readPackIndex({
      fs,
      cache,
      filename: indexFile,
      getExternalRefDelta
    });
    if (p.error)
      throw new InternalError(p.error);
    for (const oid of p.offsets.keys()) {
      if (oid.startsWith(short))
        results.push(oid);
    }
  }
  return results;
async function _expandOid({ fs, cache, gitdir, oid: short }) {
  const getExternalRefDelta = (oid) => _readObject({ fs, cache, gitdir, oid });
  const results1 = await expandOidLoose({ fs, gitdir, oid: short });
  const results2 = await expandOidPacked({
  const results = results1.concat(results2);
  if (results.length === 1) {
    return results[0];
  }
  if (results.length > 1) {
    throw new AmbiguousError("oids", short, results);
  }
  throw new NotFoundError(`an object matching "${short}"`);
async function expandOid({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oid,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    return await _expandOid({
      fs: new FileSystem(fs),
      oid
    });
  } catch (err) {
    err.caller = "git.expandOid";
    throw err;
  }
}
async function expandRef({ fs, dir, gitdir = join(dir, ".git"), ref }) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    return await GitRefManager.expand({
      fs: new FileSystem(fs),
      gitdir,
      ref
  } catch (err) {
    err.caller = "git.expandRef";
    throw err;
  }
}
async function _findMergeBase({ fs, cache, gitdir, oids }) {
  const visits = {};
  const passes = oids.length;
  let heads = oids.map((oid, index2) => ({ index: index2, oid }));
  while (heads.length) {
    const result = new Set();
    for (const { oid, index: index2 } of heads) {
      if (!visits[oid])
        visits[oid] = new Set();
      visits[oid].add(index2);
      if (visits[oid].size === passes) {
        result.add(oid);
      }
    if (result.size > 0) {
      return [...result];
    const newheads = new Map();
    for (const { oid, index: index2 } of heads) {
      try {
        const { object } = await _readObject({ fs, cache, gitdir, oid });
        const commit2 = GitCommit.from(object);
        const { parent } = commit2.parseHeaders();
        for (const oid2 of parent) {
          if (!visits[oid2] || !visits[oid2].has(index2)) {
            newheads.set(oid2 + ":" + index2, { oid: oid2, index: index2 });
      } catch (err) {
    heads = Array.from(newheads.values());
  }
  return [];
async function mergeTree({
  fs,
  cache,
  dir,
  gitdir = join(dir, ".git"),
  ourOid,
  baseOid,
  theirOid,
  ourName = "ours",
  baseName = "base",
  theirName = "theirs",
  dryRun = false,
  abortOnConflict = true,
  mergeDriver
}) {
  const ourTree = TREE({ ref: ourOid });
  const baseTree = TREE({ ref: baseOid });
  const theirTree = TREE({ ref: theirOid });
  const unmergedFiles = [];
  let cleanMerge = true;
  const results = await _walk({
    gitdir,
    trees: [ourTree, baseTree, theirTree],
    map: async function(filepath, [ours, base, theirs]) {
      const path2 = basename(filepath);
      const ourChange = await modified(ours, base);
      const theirChange = await modified(theirs, base);
      switch (`${ourChange}-${theirChange}`) {
        case "false-false": {
          return {
            mode: await base.mode(),
            path: path2,
            oid: await base.oid(),
            type: await base.type()
          };
        }
        case "false-true": {
          return theirs ? {
            mode: await theirs.mode(),
            path: path2,
            oid: await theirs.oid(),
            type: await theirs.type()
          } : void 0;
        }
        case "true-false": {
          return ours ? {
            mode: await ours.mode(),
            path: path2,
            oid: await ours.oid(),
            type: await ours.type()
          } : void 0;
        }
        case "true-true": {
          if (ours && base && theirs && await ours.type() === "blob" && await base.type() === "blob" && await theirs.type() === "blob") {
            return mergeBlobs({
              fs,
              gitdir,
              path: path2,
              ours,
              base,
              theirs,
              ourName,
              baseName,
              theirName,
              mergeDriver
            }).then((r) => {
              cleanMerge = cleanMerge && r.cleanMerge;
              unmergedFiles.push(filepath);
              return r.mergeResult;
            });
          throw new MergeNotSupportedError();
      }
    },
    reduce: async (parent, children2) => {
      const entries = children2.filter(Boolean);
      if (!parent)
        return;
      if (parent && parent.type === "tree" && entries.length === 0)
        return;
      if (entries.length > 0) {
        const tree = new GitTree(entries);
        const object = tree.toObject();
        const oid = await _writeObject({
          type: "tree",
          object,
          dryRun
        parent.oid = oid;
      return parent;
  if (!cleanMerge) {
    if (dir && !abortOnConflict) {
      await _walk({
        fs,
        cache,
        dir,
        gitdir,
        trees: [TREE({ ref: results.oid })],
        map: async function(filepath, [entry]) {
          const path2 = `${dir}/${filepath}`;
          if (await entry.type() === "blob") {
            const mode = await entry.mode();
            const content = new TextDecoder().decode(await entry.content());
            await fs.write(path2, content, { mode });
          }
          return true;
        }
      });
    throw new MergeConflictError(unmergedFiles);
  }
  return results.oid;
}
async function modified(entry, base) {
  if (!entry && !base)
    return false;
  if (entry && !base)
    return true;
  if (!entry && base)
  if (await entry.type() === "tree" && await base.type() === "tree") {
    return false;
  }
  if (await entry.type() === await base.type() && await entry.mode() === await base.mode() && await entry.oid() === await base.oid()) {
    return false;
  }
  return true;
}
async function mergeBlobs({
  fs,
  gitdir,
  path: path2,
  ours,
  base,
  theirs,
  ourName,
  theirName,
  baseName,
  dryRun,
  mergeDriver = mergeFile
}) {
  const type = "blob";
  const mode = await base.mode() === await ours.mode() ? await theirs.mode() : await ours.mode();
  if (await ours.oid() === await theirs.oid()) {
    return {
      cleanMerge: true,
      mergeResult: { mode, path: path2, oid: await ours.oid(), type }
    };
  }
  if (await ours.oid() === await base.oid()) {
    return {
      cleanMerge: true,
      mergeResult: { mode, path: path2, oid: await theirs.oid(), type }
    };
  }
  if (await theirs.oid() === await base.oid()) {
    return {
      cleanMerge: true,
      mergeResult: { mode, path: path2, oid: await ours.oid(), type }
    };
  }
  const ourContent = Buffer2.from(await ours.content()).toString("utf8");
  const baseContent = Buffer2.from(await base.content()).toString("utf8");
  const theirContent = Buffer2.from(await theirs.content()).toString("utf8");
  const { mergedText, cleanMerge } = await mergeDriver({
    branches: [baseName, ourName, theirName],
    contents: [baseContent, ourContent, theirContent],
    path: path2
  });
  const oid = await _writeObject({
    fs,
    gitdir,
    type: "blob",
    object: Buffer2.from(mergedText, "utf8"),
    dryRun
  return { cleanMerge, mergeResult: { mode, path: path2, oid, type } };
async function _merge({
  fs,
  cache,
  dir,
  gitdir,
  ours,
  theirs,
  fastForward: fastForward2 = true,
  fastForwardOnly = false,
  dryRun = false,
  noUpdateBranch = false,
  abortOnConflict = true,
  message,
  author,
  committer,
  signingKey,
  onSign,
  mergeDriver
}) {
  if (ours === void 0) {
    ours = await _currentBranch({ fs, gitdir, fullname: true });
  }
  ours = await GitRefManager.expand({
    ref: ours
  });
  theirs = await GitRefManager.expand({
    fs,
    gitdir,
    ref: theirs
  });
  const ourOid = await GitRefManager.resolve({
    fs,
    gitdir,
    ref: ours
  });
  const theirOid = await GitRefManager.resolve({
    fs,
    gitdir,
    ref: theirs
  });
  const baseOids = await _findMergeBase({
    fs,
    cache,
    gitdir,
    oids: [ourOid, theirOid]
  });
  if (baseOids.length !== 1) {
    throw new MergeNotSupportedError();
  }
  const baseOid = baseOids[0];
  if (baseOid === theirOid) {
    return {
      oid: ourOid,
      alreadyMerged: true
    };
  }
  if (fastForward2 && baseOid === ourOid) {
    if (!dryRun && !noUpdateBranch) {
      await GitRefManager.writeRef({ fs, gitdir, ref: ours, value: theirOid });
    return {
      oid: theirOid,
      fastForward: true
    };
  } else {
    if (fastForwardOnly) {
      throw new FastForwardError();
    const tree = await mergeTree({
      cache,
      dir,
      ourOid,
      theirOid,
      baseOid,
      ourName: abbreviateRef(ours),
      baseName: "base",
      theirName: abbreviateRef(theirs),
      dryRun,
      abortOnConflict,
      mergeDriver
    });
    if (!message) {
      message = `Merge branch '${abbreviateRef(theirs)}' into ${abbreviateRef(ours)}`;
    }
    const oid = await _commit({
      fs,
      cache,
      gitdir,
      message,
      ref: ours,
      tree,
      parent: [ourOid, theirOid],
      author,
      committer,
      signingKey,
      onSign,
      dryRun,
      noUpdateBranch
    return {
      oid,
      tree,
      mergeCommit: true
    };
  }
async function _pull({
  fs,
  cache,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir,
  ref,
  url,
  remote,
  remoteRef,
  prune,
  pruneTags,
  fastForward: fastForward2,
  fastForwardOnly,
  corsProxy,
  singleBranch,
  headers,
  author,
  committer,
  signingKey
}) {
  try {
    if (!ref) {
      const head = await _currentBranch({ fs, gitdir });
      if (!head) {
        throw new MissingParameterError("ref");
      }
      ref = head;
    const { fetchHead, fetchHeadDescription } = await _fetch({
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      corsProxy,
      ref,
      url,
      remote,
      remoteRef,
      singleBranch,
      headers,
      prune,
      pruneTags
    await _merge({
      cache,
      ours: ref,
      theirs: fetchHead,
      fastForward: fastForward2,
      fastForwardOnly,
      message: `Merge ${fetchHeadDescription}`,
      author,
      committer,
      signingKey,
      dryRun: false,
      noUpdateBranch: false
    await _checkout({
      cache,
      onProgress,
      dir,
      ref,
      remote,
      noCheckout: false
  } catch (err) {
    err.caller = "git.pull";
    throw err;
  }
}
async function fastForward({
  fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  url,
  remote,
  remoteRef,
  corsProxy,
  singleBranch,
  headers = {},
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("http", http);
    assertParameter("gitdir", gitdir);
    const thisWillNotBeUsed = {
      name: "",
      email: "",
      timestamp: Date.now(),
      timezoneOffset: 0
    };
    return await _pull({
      fs: new FileSystem(fs),
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      dir,
      ref,
      url,
      remote,
      remoteRef,
      fastForwardOnly: true,
      corsProxy,
      singleBranch,
      headers,
      author: thisWillNotBeUsed,
      committer: thisWillNotBeUsed
  } catch (err) {
    err.caller = "git.fastForward";
    throw err;
  }
}
async function fetch({
  fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  remote,
  remoteRef,
  url,
  corsProxy,
  depth = null,
  since = null,
  exclude = [],
  relative = false,
  tags = false,
  singleBranch = false,
  headers = {},
  prune = false,
  pruneTags = false,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("http", http);
    assertParameter("gitdir", gitdir);
    return await _fetch({
      fs: new FileSystem(fs),
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      gitdir,
      ref,
      remote,
      remoteRef,
      url,
      corsProxy,
      depth,
      since,
      exclude,
      relative,
      tags,
      singleBranch,
      headers,
      prune,
      pruneTags
    });
  } catch (err) {
    err.caller = "git.fetch";
    throw err;
  }
}
async function findMergeBase({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oids,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oids", oids);
    return await _findMergeBase({
      fs: new FileSystem(fs),
      oids
  } catch (err) {
    err.caller = "git.findMergeBase";
    throw err;
  }
}
async function _findRoot({ fs, filepath }) {
  if (await fs.exists(join(filepath, ".git"))) {
    return filepath;
  } else {
    const parent = dirname(filepath);
    if (parent === filepath) {
      throw new NotFoundError(`git root for ${filepath}`);
    return _findRoot({ fs, filepath: parent });
  }
async function findRoot({ fs, filepath }) {
  try {
    assertParameter("fs", fs);
    assertParameter("filepath", filepath);
    return await _findRoot({ fs: new FileSystem(fs), filepath });
  } catch (err) {
    err.caller = "git.findRoot";
    throw err;
  }
async function getConfig({ fs, dir, gitdir = join(dir, ".git"), path: path2 }) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("path", path2);
    return await _getConfig({
      fs: new FileSystem(fs),
      gitdir,
      path: path2
    });
  } catch (err) {
    err.caller = "git.getConfig";
    throw err;
  }
async function _getConfigAll({ fs, gitdir, path: path2 }) {
  const config = await GitConfigManager.get({ fs, gitdir });
  return config.getall(path2);
async function getConfigAll({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  path: path2
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("path", path2);
    return await _getConfigAll({
      fs: new FileSystem(fs),
      gitdir,
      path: path2
    });
  } catch (err) {
    err.caller = "git.getConfigAll";
    throw err;
  }
async function getRemoteInfo({
  http,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  corsProxy,
  url,
  headers = {},
  forPush = false
}) {
  try {
    assertParameter("http", http);
    assertParameter("url", url);
    const GitRemoteHTTP2 = GitRemoteManager.getRemoteHelperFor({ url });
    const remote = await GitRemoteHTTP2.discover({
      http,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      corsProxy,
      service: forPush ? "git-receive-pack" : "git-upload-pack",
      url,
      headers,
      protocolVersion: 1
    });
    const result = {
      capabilities: [...remote.capabilities]
    };
    for (const [ref, oid] of remote.refs) {
      const parts = ref.split("/");
      const last2 = parts.pop();
      let o = result;
      for (const part of parts) {
        o[part] = o[part] || {};
        o = o[part];
      o[last2] = oid;
    for (const [symref, ref] of remote.symrefs) {
      const parts = symref.split("/");
      const last2 = parts.pop();
      let o = result;
      for (const part of parts) {
        o[part] = o[part] || {};
        o = o[part];
      o[last2] = ref;
    return result;
  } catch (err) {
    err.caller = "git.getRemoteInfo";
    throw err;
  }
async function getRemoteInfo2({
  http,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  corsProxy,
  url,
  headers = {},
  forPush = false,
  protocolVersion = 2
}) {
  try {
    assertParameter("http", http);
    assertParameter("url", url);
    const GitRemoteHTTP2 = GitRemoteManager.getRemoteHelperFor({ url });
    const remote = await GitRemoteHTTP2.discover({
      http,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      corsProxy,
      service: forPush ? "git-receive-pack" : "git-upload-pack",
      url,
      headers,
      protocolVersion
    });
    if (remote.protocolVersion === 2) {
        protocolVersion: remote.protocolVersion,
        capabilities: remote.capabilities2
    const capabilities = {};
    for (const cap of remote.capabilities) {
      const [key2, value] = cap.split("=");
      if (value) {
        capabilities[key2] = value;
        capabilities[key2] = true;
    return {
      protocolVersion: 1,
      capabilities,
      refs: formatInfoRefs(remote, void 0, true, true)
    };
  } catch (err) {
    err.caller = "git.getRemoteInfo2";
    throw err;
  }
async function hashObject({
  type,
  object,
  format = "content",
  oid = void 0
}) {
  if (format !== "deflated") {
    if (format !== "wrapped") {
      object = GitObject.wrap({ type, object });
    oid = await shasum(object);
  }
  return { oid, object };
async function hashBlob({ object }) {
  try {
    assertParameter("object", object);
    if (typeof object === "string") {
      object = Buffer2.from(object, "utf8");
    } else {
      object = Buffer2.from(object);
    const type = "blob";
    const { oid, object: _object } = await hashObject({
      type: "blob",
      format: "content",
      object
    });
    return { oid, type, object: new Uint8Array(_object), format: "wrapped" };
  } catch (err) {
    err.caller = "git.hashBlob";
    throw err;
  }
async function _indexPack({
  fs,
  cache,
  onProgress,
  dir,
  gitdir,
  filepath
}) {
  try {
    filepath = join(dir, filepath);
    const pack = await fs.read(filepath);
    const getExternalRefDelta = (oid) => _readObject({ fs, cache, gitdir, oid });
    const idx = await GitPackIndex.fromPack({
      pack,
      getExternalRefDelta,
      onProgress
    });
    await fs.write(filepath.replace(/\.pack$/, ".idx"), await idx.toBuffer());
    return {
      oids: [...idx.hashes]
    };
  } catch (err) {
    err.caller = "git.indexPack";
    throw err;
  }
}
async function indexPack({
  fs,
  onProgress,
  dir,
  gitdir = join(dir, ".git"),
  filepath,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("dir", dir);
    assertParameter("gitdir", dir);
    assertParameter("filepath", filepath);
    return await _indexPack({
      fs: new FileSystem(fs),
      cache,
      onProgress,
      dir,
      gitdir,
      filepath
    });
  } catch (err) {
    err.caller = "git.indexPack";
    throw err;
  }
}
async function init({
  fs,
  bare = false,
  dir,
  gitdir = bare ? dir : join(dir, ".git"),
  defaultBranch = "master"
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    if (!bare) {
      assertParameter("dir", dir);
    return await _init({
      fs: new FileSystem(fs),
      bare,
      dir,
      gitdir,
      defaultBranch
    });
  } catch (err) {
    err.caller = "git.init";
    throw err;
  }
async function _isDescendent({
  fs,
  cache,
  gitdir,
  oid,
  ancestor,
  depth
}) {
  const shallows = await GitShallowManager.read({ fs, gitdir });
  if (!oid) {
    throw new MissingParameterError("oid");
  }
  if (!ancestor) {
    throw new MissingParameterError("ancestor");
  }
  if (oid === ancestor)
    return false;
  const queue = [oid];
  const visited = new Set();
  let searchdepth = 0;
  while (queue.length) {
    if (searchdepth++ === depth) {
      throw new MaxDepthError(depth);
    }
    const oid2 = queue.shift();
    const { type, object } = await _readObject({
      fs,
      cache,
      gitdir,
      oid: oid2
    });
    if (type !== "commit") {
      throw new ObjectTypeError(oid2, type, "commit");
    const commit2 = GitCommit.from(object).parse();
    for (const parent of commit2.parent) {
      if (parent === ancestor)
        return true;
    if (!shallows.has(oid2)) {
        if (!visited.has(parent)) {
          queue.push(parent);
          visited.add(parent);
  }
  return false;
async function isDescendent({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oid,
  ancestor,
  depth = -1,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    assertParameter("ancestor", ancestor);
    return await _isDescendent({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      oid,
      ancestor,
      depth
    });
  } catch (err) {
    err.caller = "git.isDescendent";
    throw err;
  }
async function isIgnored({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  filepath
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("dir", dir);
    assertParameter("gitdir", gitdir);
    assertParameter("filepath", filepath);
    return GitIgnoreManager.isIgnored({
      fs: new FileSystem(fs),
      dir,
      gitdir,
      filepath
    });
  } catch (err) {
    err.caller = "git.isIgnored";
    throw err;
  }
async function listBranches({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  remote
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    return GitRefManager.listBranches({
      fs: new FileSystem(fs),
      gitdir,
      remote
    });
  } catch (err) {
    err.caller = "git.listBranches";
    throw err;
  }
}
async function _listFiles({ fs, gitdir, ref, cache }) {
  if (ref) {
    const oid = await GitRefManager.resolve({ gitdir, fs, ref });
    const filenames = [];
    await accumulateFilesFromOid({
      fs,
      cache,
      gitdir,
      oid,
      filenames,
      prefix: ""
    });
    return filenames;
  } else {
    return GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      return index2.entries.map((x) => x.path);
    });
  }
async function accumulateFilesFromOid({
  fs,
  cache,
  gitdir,
  oid,
  filenames,
  prefix
}) {
  const { tree } = await _readTree({ fs, cache, gitdir, oid });
  for (const entry of tree) {
    if (entry.type === "tree") {
      await accumulateFilesFromOid({
        oid: entry.oid,
        prefix: join(prefix, entry.path)
      filenames.push(join(prefix, entry.path));
  }
}
async function listFiles({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    return await _listFiles({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      ref
    });
  } catch (err) {
    err.caller = "git.listFiles";
    throw err;
  }
async function _listNotes({ fs, cache, gitdir, ref }) {
  let parent;
  try {
    parent = await GitRefManager.resolve({ gitdir, fs, ref });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return [];
    }
  }
  const result = await _readTree({
    oid: parent
  const notes = result.tree.map((entry) => ({
    target: entry.path,
    note: entry.oid
  }));
  return notes;
async function listNotes({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  ref = "refs/notes/commits",
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    return await _listNotes({
      fs: new FileSystem(fs),
      ref
  } catch (err) {
    err.caller = "git.listNotes";
    throw err;
  }
async function _listRemotes({ fs, gitdir }) {
  const config = await GitConfigManager.get({ fs, gitdir });
  const remoteNames = await config.getSubsections("remote");
  const remotes = Promise.all(remoteNames.map(async (remote) => {
    const url = await config.get(`remote.${remote}.url`);
    return { remote, url };
  }));
  return remotes;
async function listRemotes({ fs, dir, gitdir = join(dir, ".git") }) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    return await _listRemotes({
      fs: new FileSystem(fs),
      gitdir
    });
  } catch (err) {
    err.caller = "git.listRemotes";
    throw err;
  }
async function parseListRefsResponse(stream) {
  const read = GitPktLine.streamReader(stream);
  const refs = [];
  let line;
  while (true) {
    line = await read();
    if (line === true)
      break;
    if (line === null)
      continue;
    line = line.toString("utf8").replace(/\n$/, "");
    const [oid, ref, ...attrs] = line.split(" ");
    const r = { ref, oid };
    for (const attr2 of attrs) {
      const [name, value] = attr2.split(":");
      if (name === "symref-target") {
        r.target = value;
      } else if (name === "peeled") {
        r.peeled = value;
    refs.push(r);
  }
  return refs;
async function writeListRefsRequest({ prefix, symrefs, peelTags }) {
  const packstream = [];
  packstream.push(GitPktLine.encode("command=ls-refs\n"));
  packstream.push(GitPktLine.encode(`agent=${pkg.agent}
  if (peelTags || symrefs || prefix) {
    packstream.push(GitPktLine.delim());
  }
  if (peelTags)
    packstream.push(GitPktLine.encode("peel"));
  if (symrefs)
    packstream.push(GitPktLine.encode("symrefs"));
  if (prefix)
    packstream.push(GitPktLine.encode(`ref-prefix ${prefix}`));
  packstream.push(GitPktLine.flush());
  return packstream;
async function listServerRefs({
  http,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  corsProxy,
  url,
  headers = {},
  forPush = false,
  protocolVersion = 2,
  prefix,
  symrefs,
  peelTags
}) {
  try {
    assertParameter("http", http);
    assertParameter("url", url);
    const remote = await GitRemoteHTTP.discover({
      http,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      corsProxy,
      service: forPush ? "git-receive-pack" : "git-upload-pack",
      url,
      headers,
      protocolVersion
    });
    if (remote.protocolVersion === 1) {
      return formatInfoRefs(remote, prefix, symrefs, peelTags);
    const body = await writeListRefsRequest({ prefix, symrefs, peelTags });
    const res = await GitRemoteHTTP.connect({
      http,
      auth: remote.auth,
      headers,
      corsProxy,
      service: forPush ? "git-receive-pack" : "git-upload-pack",
      url,
      body
    });
    return parseListRefsResponse(res.body);
  } catch (err) {
    err.caller = "git.listServerRefs";
    throw err;
  }
async function listTags({ fs, dir, gitdir = join(dir, ".git") }) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    return GitRefManager.listTags({ fs: new FileSystem(fs), gitdir });
  } catch (err) {
    err.caller = "git.listTags";
    throw err;
  }
async function resolveCommit({ fs, cache, gitdir, oid }) {
  const { type, object } = await _readObject({ fs, cache, gitdir, oid });
  if (type === "tag") {
    oid = GitAnnotatedTag.from(object).parse().object;
    return resolveCommit({ fs, cache, gitdir, oid });
  }
  if (type !== "commit") {
    throw new ObjectTypeError(oid, type, "commit");
  }
  return { commit: GitCommit.from(object), oid };
async function _readCommit({ fs, cache, gitdir, oid }) {
  const { commit: commit2, oid: commitOid } = await resolveCommit({
    fs,
    cache,
    gitdir,
    oid
  const result = {
    oid: commitOid,
    commit: commit2.parse(),
    payload: commit2.withoutSignature()
  };
  return result;
async function resolveFileIdInTree({ fs, cache, gitdir, oid, fileId }) {
  if (fileId === EMPTY_OID)
    return;
  const _oid = oid;
  let filepath;
  const result = await resolveTree({ fs, cache, gitdir, oid });
  const tree = result.tree;
  if (fileId === result.oid) {
    filepath = result.path;
  } else {
    filepath = await _resolveFileId({
      fs,
      cache,
      gitdir,
      tree,
      fileId,
      oid: _oid
    });
    if (Array.isArray(filepath)) {
      if (filepath.length === 0)
        filepath = void 0;
      else if (filepath.length === 1)
        filepath = filepath[0];
    }
  }
  return filepath;
}
async function _resolveFileId({
  fs,
  cache,
  gitdir,
  tree,
  fileId,
  oid,
  filepaths = [],
  parentPath = ""
}) {
  const walks = tree.entries().map(function(entry) {
    let result;
    if (entry.oid === fileId) {
      result = join(parentPath, entry.path);
      filepaths.push(result);
    } else if (entry.type === "tree") {
      result = _readObject({
        oid: entry.oid
      }).then(function({ object }) {
        return _resolveFileId({
          fs,
          cache,
          gitdir,
          tree: GitTree.from(object),
          fileId,
          oid,
          filepaths,
          parentPath: join(parentPath, entry.path)
        });
    return result;
  await Promise.all(walks);
  return filepaths;
async function _log({
  fs,
  cache,
  gitdir,
  filepath,
  ref,
  depth,
  since,
  force,
  follow
}) {
  const sinceTimestamp = typeof since === "undefined" ? void 0 : Math.floor(since.valueOf() / 1e3);
  const commits = [];
  const shallowCommits = await GitShallowManager.read({ fs, gitdir });
  const oid = await GitRefManager.resolve({ fs, gitdir, ref });
  const tips = [await _readCommit({ fs, cache, gitdir, oid })];
  let lastFileOid;
  let lastCommit;
  let isOk;
  function endCommit(commit2) {
    if (isOk && filepath)
      commits.push(commit2);
  }
  while (tips.length > 0) {
    const commit2 = tips.pop();
    if (sinceTimestamp !== void 0 && commit2.commit.committer.timestamp <= sinceTimestamp) {
      break;
    }
    if (filepath) {
      let vFileOid;
      try {
        vFileOid = await resolveFilepath({
          oid: commit2.commit.tree,
          filepath
        if (lastCommit && lastFileOid !== vFileOid) {
          commits.push(lastCommit);
        }
        lastFileOid = vFileOid;
        lastCommit = commit2;
        isOk = true;
      } catch (e) {
        if (e instanceof NotFoundError) {
          let found = follow && lastFileOid;
          if (found) {
            found = await resolveFileIdInTree({
              fs,
              cache,
              gitdir,
              oid: commit2.commit.tree,
              fileId: lastFileOid
            });
              if (Array.isArray(found)) {
                if (lastCommit) {
                  const lastFound = await resolveFileIdInTree({
                    fs,
                    cache,
                    gitdir,
                    oid: lastCommit.commit.tree,
                    fileId: lastFileOid
                  });
                  if (Array.isArray(lastFound)) {
                    found = found.filter((p) => lastFound.indexOf(p) === -1);
                    if (found.length === 1) {
                      found = found[0];
                      filepath = found;
                      if (lastCommit)
                        commits.push(lastCommit);
                    } else {
                      found = false;
                      if (lastCommit)
                        commits.push(lastCommit);
                      break;
              } else {
                filepath = found;
                if (lastCommit)
                  commits.push(lastCommit);
          }
          if (!found) {
            if (isOk && lastFileOid) {
              commits.push(lastCommit);
              if (!force)
                break;
            if (!force && !follow)
              throw e;
          lastCommit = commit2;
          isOk = false;
        } else
          throw e;
    } else {
      commits.push(commit2);
    if (depth !== void 0 && commits.length === depth) {
      endCommit(commit2);
      break;
    if (!shallowCommits.has(commit2.oid)) {
      for (const oid2 of commit2.commit.parent) {
        const commit3 = await _readCommit({ fs, cache, gitdir, oid: oid2 });
        if (!tips.map((commit4) => commit4.oid).includes(commit3.oid)) {
          tips.push(commit3);
        }
    if (tips.length === 0) {
      endCommit(commit2);
    tips.sort((a, b) => compareAge(a.commit, b.commit));
  }
  return commits;
async function log({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  filepath,
  ref = "HEAD",
  depth,
  since,
  force,
  follow,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    return await _log({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      filepath,
      ref,
      depth,
      since,
      force,
      follow
    });
  } catch (err) {
    err.caller = "git.log";
    throw err;
  }
async function merge({
  fs: _fs,
  onSign,
  dir,
  gitdir = join(dir, ".git"),
  ours,
  theirs,
  fastForward: fastForward2 = true,
  fastForwardOnly = false,
  dryRun = false,
  noUpdateBranch = false,
  abortOnConflict = true,
  message,
  author: _author,
  committer: _committer,
  signingKey,
  cache = {},
  mergeDriver
}) {
  try {
    assertParameter("fs", _fs);
    if (signingKey) {
      assertParameter("onSign", onSign);
    const fs = new FileSystem(_fs);
    const author = await normalizeAuthorObject({ fs, gitdir, author: _author });
    if (!author && (!fastForwardOnly || !fastForward2)) {
      throw new MissingNameError("author");
    }
    const committer = await normalizeCommitterObject({
      fs,
      gitdir,
      author,
      committer: _committer
    });
    if (!committer && (!fastForwardOnly || !fastForward2)) {
      throw new MissingNameError("committer");
    }
    return await _merge({
      fs,
      cache,
      dir,
      gitdir,
      ours,
      theirs,
      fastForward: fastForward2,
      fastForwardOnly,
      dryRun,
      noUpdateBranch,
      abortOnConflict,
      message,
      author,
      committer,
      signingKey,
      onSign,
      mergeDriver
    });
  } catch (err) {
    err.caller = "git.merge";
    throw err;
  }
var types = {
  commit: 16,
  tree: 32,
  blob: 48,
  tag: 64,
  ofs_delta: 96,
  ref_delta: 112
};
async function _pack({
  fs,
  cache,
  dir,
  gitdir = join(dir, ".git"),
  oids
}) {
  const hash2 = new import_sha1.default();
  const outputStream = [];
  function write(chunk, enc) {
    const buff = Buffer2.from(chunk, enc);
    outputStream.push(buff);
    hash2.update(buff);
  }
  async function writeObject2({ stype, object }) {
    const type = types[stype];
    let length = object.length;
    let multibyte = length > 15 ? 128 : 0;
    const lastFour = length & 15;
    length = length >>> 4;
    let byte = (multibyte | type | lastFour).toString(16);
    write(byte, "hex");
    while (multibyte) {
      multibyte = length > 127 ? 128 : 0;
      byte = multibyte | length & 127;
      write(padHex(2, byte), "hex");
      length = length >>> 7;
    }
    write(Buffer2.from(await deflate(object)));
  }
  write("PACK");
  write("00000002", "hex");
  write(padHex(8, oids.length), "hex");
  for (const oid of oids) {
    const { type, object } = await _readObject({ fs, cache, gitdir, oid });
    await writeObject2({ write, object, stype: type });
  }
  const digest = hash2.digest();
  outputStream.push(digest);
  return outputStream;
}
async function _packObjects({ fs, cache, gitdir, oids, write }) {
  const buffers = await _pack({ fs, cache, gitdir, oids });
  const packfile = Buffer2.from(await collect(buffers));
  const packfileSha = packfile.slice(-20).toString("hex");
  const filename = `pack-${packfileSha}.pack`;
  if (write) {
    await fs.write(join(gitdir, `objects/pack/${filename}`), packfile);
    return { filename };
  }
  return {
    filename,
    packfile: new Uint8Array(packfile)
  };
}
async function packObjects({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oids,
  write = false,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oids", oids);
    return await _packObjects({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      oids,
      write
    });
  } catch (err) {
    err.caller = "git.packObjects";
    throw err;
  }
}
async function pull({
  fs: _fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  url,
  remote,
  remoteRef,
  prune = false,
  pruneTags = false,
  fastForward: fastForward2 = true,
  fastForwardOnly = false,
  corsProxy,
  singleBranch,
  headers = {},
  author: _author,
  committer: _committer,
  signingKey,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    const fs = new FileSystem(_fs);
    const author = await normalizeAuthorObject({ fs, gitdir, author: _author });
    if (!author)
      throw new MissingNameError("author");
    const committer = await normalizeCommitterObject({
      fs,
      gitdir,
      author,
      committer: _committer
    });
    if (!committer)
      throw new MissingNameError("committer");
    return await _pull({
      fs,
      cache,
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      dir,
      gitdir,
      ref,
      url,
      remote,
      remoteRef,
      fastForward: fastForward2,
      fastForwardOnly,
      corsProxy,
      singleBranch,
      headers,
      author,
      committer,
      signingKey,
      prune,
      pruneTags
    });
  } catch (err) {
    err.caller = "git.pull";
    throw err;
  }
}
async function listCommitsAndTags({
  fs,
  cache,
  dir,
  gitdir = join(dir, ".git"),
  start,
  finish
}) {
  const shallows = await GitShallowManager.read({ fs, gitdir });
  const startingSet = new Set();
  const finishingSet = new Set();
  for (const ref of start) {
    startingSet.add(await GitRefManager.resolve({ fs, gitdir, ref }));
  }
  for (const ref of finish) {
      const oid = await GitRefManager.resolve({ fs, gitdir, ref });
      finishingSet.add(oid);
  }
  const visited = new Set();
  async function walk2(oid) {
    visited.add(oid);
    const { type, object } = await _readObject({ fs, cache, gitdir, oid });
    if (type === "tag") {
      const tag2 = GitAnnotatedTag.from(object);
      const commit2 = tag2.headers().object;
      return walk2(commit2);
    if (type !== "commit") {
      throw new ObjectTypeError(oid, type, "commit");
    if (!shallows.has(oid)) {
      const commit2 = GitCommit.from(object);
      const parents = commit2.headers().parent;
      for (oid of parents) {
        if (!finishingSet.has(oid) && !visited.has(oid)) {
          await walk2(oid);
      }
  }
  for (const oid of startingSet) {
    await walk2(oid);
  }
  return visited;
async function listObjects({
  fs,
  cache,
  dir,
  gitdir = join(dir, ".git"),
  oids
}) {
  const visited = new Set();
  async function walk2(oid) {
    if (visited.has(oid))
      return;
    visited.add(oid);
    const { type, object } = await _readObject({ fs, cache, gitdir, oid });
    if (type === "tag") {
      const tag2 = GitAnnotatedTag.from(object);
      const obj = tag2.headers().object;
      await walk2(obj);
    } else if (type === "commit") {
      const commit2 = GitCommit.from(object);
      const tree = commit2.headers().tree;
      await walk2(tree);
    } else if (type === "tree") {
      const tree = GitTree.from(object);
      for (const entry of tree) {
        if (entry.type === "blob") {
          visited.add(entry.oid);
        if (entry.type === "tree") {
          await walk2(entry.oid);
        }
      }
  }
  for (const oid of oids) {
    await walk2(oid);
  }
  return visited;
async function parseReceivePackResponse(packfile) {
  const result = {};
  let response = "";
  const read = GitPktLine.streamReader(packfile);
  let line = await read();
  while (line !== true) {
    if (line !== null)
      response += line.toString("utf8") + "\n";
    line = await read();
  }
  const lines = response.toString("utf8").split("\n");
  line = lines.shift();
  if (!line.startsWith("unpack ")) {
    throw new ParseError('unpack ok" or "unpack [error message]', line);
  }
  result.ok = line === "unpack ok";
  if (!result.ok) {
    result.error = line.slice("unpack ".length);
  }
  result.refs = {};
  for (const line2 of lines) {
    if (line2.trim() === "")
      continue;
    const status2 = line2.slice(0, 2);
    const refAndMessage = line2.slice(3);
    let space2 = refAndMessage.indexOf(" ");
    if (space2 === -1)
      space2 = refAndMessage.length;
    const ref = refAndMessage.slice(0, space2);
    const error = refAndMessage.slice(space2 + 1);
    result.refs[ref] = {
      ok: status2 === "ok",
      error
    };
  }
  return result;
async function writeReceivePackRequest({
  capabilities = [],
  triplets = []
}) {
  const packstream = [];
  let capsFirstLine = `\0 ${capabilities.join(" ")}`;
  for (const trip of triplets) {
    packstream.push(GitPktLine.encode(`${trip.oldoid} ${trip.oid} ${trip.fullRef}${capsFirstLine}
    capsFirstLine = "";
  }
  packstream.push(GitPktLine.flush());
  return packstream;
async function _push({
  fs,
  cache,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  gitdir,
  ref: _ref,
  remoteRef: _remoteRef,
  remote,
  url: _url,
  force = false,
  delete: _delete = false,
  corsProxy,
  headers = {}
}) {
  const ref = _ref || await _currentBranch({ fs, gitdir });
  if (typeof ref === "undefined") {
    throw new MissingParameterError("ref");
  }
  const config = await GitConfigManager.get({ fs, gitdir });
  remote = remote || await config.get(`branch.${ref}.pushRemote`) || await config.get("remote.pushDefault") || await config.get(`branch.${ref}.remote`) || "origin";
  const url = _url || await config.get(`remote.${remote}.pushurl`) || await config.get(`remote.${remote}.url`);
  if (typeof url === "undefined") {
    throw new MissingParameterError("remote OR url");
  }
  const remoteRef = _remoteRef || await config.get(`branch.${ref}.merge`);
  if (typeof url === "undefined") {
    throw new MissingParameterError("remoteRef");
  }
  if (corsProxy === void 0) {
    corsProxy = await config.get("http.corsProxy");
  }
  const fullRef = await GitRefManager.expand({ fs, gitdir, ref });
  const oid = _delete ? "0000000000000000000000000000000000000000" : await GitRefManager.resolve({ fs, gitdir, ref: fullRef });
  const GitRemoteHTTP2 = GitRemoteManager.getRemoteHelperFor({ url });
  const httpRemote = await GitRemoteHTTP2.discover({
    service: "git-receive-pack",
    url,
    headers,
    protocolVersion: 1
  });
  const auth = httpRemote.auth;
  let fullRemoteRef;
  if (!remoteRef) {
    fullRemoteRef = fullRef;
  } else {
    try {
      fullRemoteRef = await GitRefManager.expandAgainstMap({
        ref: remoteRef,
        map: httpRemote.refs
      });
    } catch (err) {
      if (err instanceof NotFoundError) {
        fullRemoteRef = remoteRef.startsWith("refs/") ? remoteRef : `refs/heads/${remoteRef}`;
      } else {
        throw err;
      }
  }
  const oldoid = httpRemote.refs.get(fullRemoteRef) || "0000000000000000000000000000000000000000";
  const thinPack = !httpRemote.capabilities.has("no-thin");
  let objects = new Set();
  if (!_delete) {
    const finish = [...httpRemote.refs.values()];
    let skipObjects = new Set();
    if (oldoid !== "0000000000000000000000000000000000000000") {
      const mergebase = await _findMergeBase({
        fs,
        cache,
        gitdir,
        oids: [oid, oldoid]
      });
      for (const oid2 of mergebase)
        finish.push(oid2);
      if (thinPack) {
        skipObjects = await listObjects({ fs, cache, gitdir, oids: mergebase });
      }
    if (!finish.includes(oid)) {
      const commits = await listCommitsAndTags({
        fs,
        cache,
        gitdir,
        start: [oid],
        finish
      });
      objects = await listObjects({ fs, cache, gitdir, oids: commits });
    if (thinPack) {
        const ref2 = await GitRefManager.resolve({
          ref: `refs/remotes/${remote}/HEAD`,
          depth: 2
        const { oid: oid2 } = await GitRefManager.resolveAgainstMap({
          ref: ref2.replace(`refs/remotes/${remote}/`, ""),
          fullref: ref2,
          map: httpRemote.refs
        });
        const oids = [oid2];
        for (const oid3 of await listObjects({ fs, cache, gitdir, oids })) {
          skipObjects.add(oid3);
      } catch (e) {
      for (const oid2 of skipObjects) {
        objects.delete(oid2);
    if (oid === oldoid)
      force = true;
    if (!force) {
      if (fullRef.startsWith("refs/tags") && oldoid !== "0000000000000000000000000000000000000000") {
        throw new PushRejectedError("tag-exists");
      }
      if (oid !== "0000000000000000000000000000000000000000" && oldoid !== "0000000000000000000000000000000000000000" && !await _isDescendent({
        fs,
        cache,
        gitdir,
        oid,
        ancestor: oldoid,
        depth: -1
      })) {
        throw new PushRejectedError("not-fast-forward");
  }
  const capabilities = filterCapabilities([...httpRemote.capabilities], ["report-status", "side-band-64k", `agent=${pkg.agent}`]);
  const packstream1 = await writeReceivePackRequest({
    capabilities,
    triplets: [{ oldoid, oid, fullRef: fullRemoteRef }]
  const packstream2 = _delete ? [] : await _pack({
    cache,
    gitdir,
    oids: [...objects]
  });
  const res = await GitRemoteHTTP2.connect({
    service: "git-receive-pack",
    url,
    auth,
    headers,
    body: [...packstream1, ...packstream2]
  const { packfile, progress } = await GitSideBand.demux(res.body);
  if (onMessage) {
    const lines = splitLines(progress);
    forAwait(lines, async (line) => {
      await onMessage(line);
    });
  }
  const result = await parseReceivePackResponse(packfile);
  if (res.headers) {
    result.headers = res.headers;
  }
  if (remote && result.ok && result.refs[fullRemoteRef].ok) {
    const ref2 = `refs/remotes/${remote}/${fullRemoteRef.replace("refs/heads", "")}`;
    if (_delete) {
      await GitRefManager.deleteRef({ fs, gitdir, ref: ref2 });
    } else {
      await GitRefManager.writeRef({ fs, gitdir, ref: ref2, value: oid });
  }
  if (result.ok && Object.values(result.refs).every((result2) => result2.ok)) {
    return result;
  } else {
    const prettyDetails = Object.entries(result.refs).filter(([k, v]) => !v.ok).map(([k, v]) => `
  - ${k}: ${v.error}`).join("");
    throw new GitPushError(prettyDetails, result);
  }
async function push({
  fs,
  http,
  onProgress,
  onMessage,
  onAuth,
  onAuthSuccess,
  onAuthFailure,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  remoteRef,
  remote = "origin",
  url,
  force = false,
  delete: _delete = false,
  corsProxy,
  headers = {},
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("http", http);
    assertParameter("gitdir", gitdir);
    return await _push({
      fs: new FileSystem(fs),
      http,
      onProgress,
      onMessage,
      onAuth,
      onAuthSuccess,
      onAuthFailure,
      ref,
      remoteRef,
      remote,
      url,
      force,
      delete: _delete,
      corsProxy,
      headers
  } catch (err) {
    err.caller = "git.push";
    throw err;
  }
async function resolveBlob({ fs, cache, gitdir, oid }) {
  const { type, object } = await _readObject({ fs, cache, gitdir, oid });
  if (type === "tag") {
    oid = GitAnnotatedTag.from(object).parse().object;
    return resolveBlob({ fs, cache, gitdir, oid });
  }
  if (type !== "blob") {
    throw new ObjectTypeError(oid, type, "blob");
  }
  return { oid, blob: new Uint8Array(object) };
async function _readBlob({
  fs,
  cache,
  gitdir,
  oid,
  filepath = void 0
}) {
  if (filepath !== void 0) {
    oid = await resolveFilepath({ fs, cache, gitdir, oid, filepath });
  }
  const blob = await resolveBlob({
  });
  return blob;
}
async function readBlob({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oid,
  filepath,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    return await _readBlob({
      fs: new FileSystem(fs),
      oid,
      filepath
  } catch (err) {
    err.caller = "git.readBlob";
    throw err;
  }
}
async function readCommit({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oid,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    return await _readCommit({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      oid
    });
  } catch (err) {
    err.caller = "git.readCommit";
    throw err;
  }
async function _readNote({
  fs,
  cache,
  gitdir,
  ref = "refs/notes/commits",
  oid
}) {
  const parent = await GitRefManager.resolve({ gitdir, fs, ref });
  const { blob } = await _readBlob({
    cache,
    gitdir,
    oid: parent,
    filepath: oid
  return blob;
async function readNote({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  ref = "refs/notes/commits",
  oid,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    assertParameter("oid", oid);
    return await _readNote({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      ref,
      oid
    });
  } catch (err) {
    err.caller = "git.readNote";
    throw err;
  }
}
async function readObject({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  oid,
  format = "parsed",
  filepath = void 0,
  encoding = void 0,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    const fs = new FileSystem(_fs);
    if (filepath !== void 0) {
      oid = await resolveFilepath({
        filepath
    const _format = format === "parsed" ? "content" : format;
    const result = await _readObject({
      format: _format
    });
    result.oid = oid;
    if (format === "parsed") {
      result.format = "parsed";
      switch (result.type) {
        case "commit":
          result.object = GitCommit.from(result.object).parse();
          break;
        case "tree":
          result.object = GitTree.from(result.object).entries();
          break;
        case "blob":
          if (encoding) {
            result.object = result.object.toString(encoding);
          } else {
            result.object = new Uint8Array(result.object);
            result.format = "content";
          }
          break;
        case "tag":
          result.object = GitAnnotatedTag.from(result.object).parse();
          break;
        default:
          throw new ObjectTypeError(result.oid, result.type, "blob|commit|tag|tree");
      }
    } else if (result.format === "deflated" || result.format === "wrapped") {
      result.type = result.format;
  } catch (err) {
    err.caller = "git.readObject";
    throw err;
  }
async function _readTag({ fs, cache, gitdir, oid }) {
  const { type, object } = await _readObject({
    cache,
    gitdir,
    format: "content"
  if (type !== "tag") {
    throw new ObjectTypeError(oid, type, "tag");
  }
  const tag2 = GitAnnotatedTag.from(object);
  const result = {
    tag: tag2.parse(),
    payload: tag2.payload()
  };
  return result;
async function readTag({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oid,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    return await _readTag({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      oid
    });
  } catch (err) {
    err.caller = "git.readTag";
    throw err;
  }
}
async function readTree({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  oid,
  filepath = void 0,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    return await _readTree({
      fs: new FileSystem(fs),
      cache,
      gitdir,
      oid,
      filepath
    });
  } catch (err) {
    err.caller = "git.readTree";
    throw err;
  }
}
async function remove({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  filepath,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("filepath", filepath);
    await GitIndexManager.acquire({ fs: new FileSystem(_fs), gitdir, cache }, async function(index2) {
      index2.delete({ filepath });
    });
  } catch (err) {
    err.caller = "git.remove";
    throw err;
  }
}
async function _removeNote({
  fs,
  cache,
  onSign,
  gitdir,
  ref = "refs/notes/commits",
  oid,
  author,
  committer,
  signingKey
}) {
  let parent;
  try {
    parent = await GitRefManager.resolve({ gitdir, fs, ref });
  } catch (err) {
    if (!(err instanceof NotFoundError)) {
  }
  const result = await _readTree({
    fs,
    gitdir,
    oid: parent || "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
  let tree = result.tree;
  tree = tree.filter((entry) => entry.path !== oid);
  const treeOid = await _writeTree({
    fs,
    gitdir,
    tree
  });
  const commitOid = await _commit({
    ref,
    tree: treeOid,
    parent: parent && [parent],
    message: `Note removed by 'isomorphic-git removeNote'
`,
  });
  return commitOid;
}
async function removeNote({
  fs: _fs,
  onSign,
  dir,
  gitdir = join(dir, ".git"),
  ref = "refs/notes/commits",
  oid,
  author: _author,
  committer: _committer,
  signingKey,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("oid", oid);
    const fs = new FileSystem(_fs);
    const author = await normalizeAuthorObject({ fs, gitdir, author: _author });
    if (!author)
      throw new MissingNameError("author");
    const committer = await normalizeCommitterObject({
      author,
      committer: _committer
    if (!committer)
      throw new MissingNameError("committer");
    return await _removeNote({
      oid,
  } catch (err) {
    err.caller = "git.removeNote";
    throw err;
  }
async function _renameBranch({
  fs,
  gitdir,
  oldref,
  ref,
  checkout: checkout2 = false
}) {
  if (ref !== import_clean_git_ref.default.clean(ref)) {
    throw new InvalidRefNameError(ref, import_clean_git_ref.default.clean(ref));
  }
  if (oldref !== import_clean_git_ref.default.clean(oldref)) {
    throw new InvalidRefNameError(oldref, import_clean_git_ref.default.clean(oldref));
  }
  const fulloldref = `refs/heads/${oldref}`;
  const fullnewref = `refs/heads/${ref}`;
  const newexist = await GitRefManager.exists({ fs, gitdir, ref: fullnewref });
  if (newexist) {
    throw new AlreadyExistsError("branch", ref, false);
  }
  const value = await GitRefManager.resolve({
    ref: fulloldref,
    depth: 1
  });
  await GitRefManager.writeRef({ fs, gitdir, ref: fullnewref, value });
  await GitRefManager.deleteRef({ fs, gitdir, ref: fulloldref });
  if (checkout2) {
    await GitRefManager.writeSymbolicRef({
      ref: "HEAD",
      value: fullnewref
  }
async function renameBranch({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  oldref,
  checkout: checkout2 = false
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    assertParameter("oldref", oldref);
    return await _renameBranch({
      fs: new FileSystem(fs),
      gitdir,
      ref,
      oldref,
      checkout: checkout2
    });
  } catch (err) {
    err.caller = "git.renameBranch";
    throw err;
  }
async function hashObject$1({ gitdir, type, object }) {
  return shasum(GitObject.wrap({ type, object }));
async function resetIndex({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  filepath,
  ref,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("filepath", filepath);
    const fs = new FileSystem(_fs);
    let oid;
    let workdirOid;
      oid = await GitRefManager.resolve({ fs, gitdir, ref: ref || "HEAD" });
    } catch (e) {
      if (ref) {
        throw e;
      }
    }
    if (oid) {
        oid = await resolveFilepath({
          fs,
          cache,
          gitdir,
          oid,
          filepath
        });
        oid = null;
      }
    }
    let stats = {
      ctime: new Date(0),
      mtime: new Date(0),
      dev: 0,
      ino: 0,
      mode: 0,
      uid: 0,
      gid: 0,
      size: 0
    };
    const object = dir && await fs.read(join(dir, filepath));
    if (object) {
      workdirOid = await hashObject$1({
        gitdir,
        type: "blob",
        object
      });
      if (oid === workdirOid) {
        stats = await fs.lstat(join(dir, filepath));
    }
    await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      index2.delete({ filepath });
        index2.insert({ filepath, stats, oid });
    });
  } catch (err) {
    err.caller = "git.reset";
    throw err;
  }
}
async function resolveRef({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  depth
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    const oid = await GitRefManager.resolve({
      fs: new FileSystem(fs),
      gitdir,
      ref,
      depth
    });
    return oid;
  } catch (err) {
    err.caller = "git.resolveRef";
    throw err;
  }
}
async function setConfig({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  path: path2,
  value,
  append: append3 = false
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("path", path2);
    const fs = new FileSystem(_fs);
    const config = await GitConfigManager.get({ fs, gitdir });
    if (append3) {
      await config.append(path2, value);
    } else {
      await config.set(path2, value);
    }
    await GitConfigManager.save({ fs, gitdir, config });
  } catch (err) {
    err.caller = "git.setConfig";
    throw err;
  }
}
async function status({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  filepath,
  cache = {}
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("filepath", filepath);
    const fs = new FileSystem(_fs);
    const ignored = await GitIgnoreManager.isIgnored({
      fs,
      gitdir,
      dir,
      filepath
    });
    if (ignored) {
      return "ignored";
    }
    const headTree = await getHeadTree({ fs, cache, gitdir });
    const treeOid = await getOidAtPath({
      fs,
      cache,
      gitdir,
      tree: headTree,
      path: filepath
    });
    const indexEntry = await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      for (const entry of index2) {
        if (entry.path === filepath)
          return entry;
      }
      return null;
    });
    const stats = await fs.lstat(join(dir, filepath));
    const H = treeOid !== null;
    const I = indexEntry !== null;
    const W = stats !== null;
    const getWorkdirOid = async () => {
      if (I && !compareStats(indexEntry, stats)) {
        return indexEntry.oid;
      } else {
        const object = await fs.read(join(dir, filepath));
        const workdirOid = await hashObject$1({
        if (I && indexEntry.oid === workdirOid) {
          if (stats.size !== -1) {
            GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
              index2.insert({ filepath, stats, oid: workdirOid });
            });
          }
        return workdirOid;
    };
    if (!H && !W && !I)
      return "absent";
    if (!H && !W && I)
      return "*absent";
    if (!H && W && !I)
      return "*added";
    if (!H && W && I) {
      const workdirOid = await getWorkdirOid();
      return workdirOid === indexEntry.oid ? "added" : "*added";
    if (H && !W && !I)
      return "deleted";
    if (H && !W && I) {
      return treeOid === indexEntry.oid ? "*deleted" : "*deleted";
    }
    if (H && W && !I) {
      const workdirOid = await getWorkdirOid();
      return workdirOid === treeOid ? "*undeleted" : "*undeletemodified";
    }
    if (H && W && I) {
      const workdirOid = await getWorkdirOid();
      if (workdirOid === treeOid) {
        return workdirOid === indexEntry.oid ? "unmodified" : "*unmodified";
      } else {
        return workdirOid === indexEntry.oid ? "modified" : "*modified";
      }
    }
  } catch (err) {
    err.caller = "git.status";
    throw err;
  }
async function getOidAtPath({ fs, cache, gitdir, tree, path: path2 }) {
  if (typeof path2 === "string")
    path2 = path2.split("/");
  const dirname2 = path2.shift();
  for (const entry of tree) {
    if (entry.path === dirname2) {
      if (path2.length === 0) {
        return entry.oid;
      }
      const { type, object } = await _readObject({
        fs,
        cache,
        oid: entry.oid
      if (type === "tree") {
        const tree2 = GitTree.from(object);
        return getOidAtPath({ fs, cache, gitdir, tree: tree2, path: path2 });
      }
      if (type === "blob") {
        throw new ObjectTypeError(entry.oid, type, "blob", path2.join("/"));
  }
  return null;
async function getHeadTree({ fs, cache, gitdir }) {
  let oid;
  try {
    oid = await GitRefManager.resolve({ fs, gitdir, ref: "HEAD" });
  } catch (e) {
    if (e instanceof NotFoundError) {
      return [];
    }
  }
  const { tree } = await _readTree({ fs, cache, gitdir, oid });
  return tree;
}
async function statusMatrix({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  ref = "HEAD",
  filepaths = ["."],
  filter,
  cache = {},
  ignored: shouldIgnore = false
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    const fs = new FileSystem(_fs);
    return await _walk({
      fs,
      cache,
      dir,
      gitdir,
      trees: [TREE({ ref }), WORKDIR(), STAGE()],
      map: async function(filepath, [head, workdir, stage]) {
        if (!head && !stage && workdir) {
          if (!shouldIgnore) {
            const isIgnored2 = await GitIgnoreManager.isIgnored({
              fs,
              dir,
              filepath
            });
            if (isIgnored2) {
              return null;
        if (!filepaths.some((base) => worthWalking(filepath, base))) {
          return null;
        if (filter) {
          if (!filter(filepath))
            return;
        const [headType, workdirType, stageType] = await Promise.all([
          head && head.type(),
          workdir && workdir.type(),
          stage && stage.type()
        ]);
        const isBlob = [headType, workdirType, stageType].includes("blob");
        if ((headType === "tree" || headType === "special") && !isBlob)
          return;
        if (headType === "commit")
          return null;
        if ((workdirType === "tree" || workdirType === "special") && !isBlob)
          return;
        if (stageType === "commit")
          return null;
        if ((stageType === "tree" || stageType === "special") && !isBlob)
          return;
        const headOid = headType === "blob" ? await head.oid() : void 0;
        const stageOid = stageType === "blob" ? await stage.oid() : void 0;
        let workdirOid;
        if (headType !== "blob" && workdirType === "blob" && stageType !== "blob") {
          workdirOid = "42";
        } else if (workdirType === "blob") {
          workdirOid = await workdir.oid();
        const entry = [void 0, headOid, workdirOid, stageOid];
        const result = entry.map((value) => entry.indexOf(value));
        result.shift();
        return [filepath, ...result];
    });
  } catch (err) {
    err.caller = "git.statusMatrix";
    throw err;
  }
async function tag({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  object,
  force = false
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    const fs = new FileSystem(_fs);
    if (ref === void 0) {
      throw new MissingParameterError("ref");
    ref = ref.startsWith("refs/tags/") ? ref : `refs/tags/${ref}`;
    const value = await GitRefManager.resolve({
      fs,
      gitdir,
      ref: object || "HEAD"
    });
    if (!force && await GitRefManager.exists({ fs, gitdir, ref })) {
      throw new AlreadyExistsError("tag", ref);
    }
    await GitRefManager.writeRef({ fs, gitdir, ref, value });
  } catch (err) {
    err.caller = "git.tag";
    throw err;
  }
async function updateIndex({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  cache = {},
  filepath,
  oid,
  mode,
  add: add2,
  remove: remove3,
  force
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("filepath", filepath);
    const fs = new FileSystem(_fs);
    if (remove3) {
      return await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
        let fileStats2;
        if (!force) {
          fileStats2 = await fs.lstat(join(dir, filepath));
          if (fileStats2) {
            if (fileStats2.isDirectory()) {
              throw new InvalidFilepathError("directory");
            return;
          }
        }
        if (index2.has({ filepath })) {
          index2.delete({
            filepath
    let fileStats;
    if (!oid) {
      fileStats = await fs.lstat(join(dir, filepath));
      if (!fileStats) {
        throw new NotFoundError(`file at "${filepath}" on disk and "remove" not set`);
      if (fileStats.isDirectory()) {
        throw new InvalidFilepathError("directory");
    return await GitIndexManager.acquire({ fs, gitdir, cache }, async function(index2) {
      if (!add2 && !index2.has({ filepath })) {
        throw new NotFoundError(`file at "${filepath}" in index and "add" not set`);
      let stats = {
        ctime: new Date(0),
        mtime: new Date(0),
        dev: 0,
        ino: 0,
        mode,
        uid: 0,
        gid: 0,
        size: 0
      };
        stats = fileStats;
        const object = stats.isSymbolicLink() ? await fs.readlink(join(dir, filepath)) : await fs.read(join(dir, filepath));
        oid = await _writeObject({
          fs,
          gitdir,
          type: "blob",
          format: "content",
          object
      }
      index2.insert({
        filepath,
        oid,
        stats
      return oid;
    });
  } catch (err) {
    err.caller = "git.updateIndex";
    throw err;
  }
async function walk({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  trees,
  map,
  reduce,
  iterate,
  cache = {}
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("trees", trees);
    return await _walk({
      fs: new FileSystem(fs),
      cache,
      dir,
      gitdir,
      trees,
      map,
      reduce,
      iterate
    });
  } catch (err) {
    err.caller = "git.walk";
    throw err;
  }
}
async function writeBlob({ fs, dir, gitdir = join(dir, ".git"), blob }) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("blob", blob);
    return await _writeObject({
      fs: new FileSystem(fs),
      gitdir,
      type: "blob",
      object: blob,
      format: "content"
    });
  } catch (err) {
    err.caller = "git.writeBlob";
    throw err;
  }
}
async function _writeCommit({ fs, gitdir, commit: commit2 }) {
  const object = GitCommit.from(commit2).toObject();
  const oid = await _writeObject({
    gitdir,
    type: "commit",
    object,
    format: "content"
  return oid;
async function writeCommit({
  fs,
  dir,
  gitdir = join(dir, ".git"),
  commit: commit2
}) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("commit", commit2);
    return await _writeCommit({
      fs: new FileSystem(fs),
      gitdir,
      commit: commit2
    });
  } catch (err) {
    err.caller = "git.writeCommit";
    throw err;
  }
async function writeObject({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  type,
  object,
  format = "parsed",
  oid,
  encoding = void 0
}) {
  try {
    const fs = new FileSystem(_fs);
    if (format === "parsed") {
      switch (type) {
        case "commit":
          object = GitCommit.from(object).toObject();
          break;
        case "tree":
          object = GitTree.from(object).toObject();
          break;
        case "blob":
          object = Buffer2.from(object, encoding);
          break;
        case "tag":
          object = GitAnnotatedTag.from(object).toObject();
          break;
        default:
          throw new ObjectTypeError(oid || "", type, "blob|commit|tag|tree");
      }
      format = "content";
    }
    oid = await _writeObject({
      type,
      oid,
      format
  } catch (err) {
    err.caller = "git.writeObject";
    throw err;
  }
}
async function writeRef({
  fs: _fs,
  dir,
  gitdir = join(dir, ".git"),
  ref,
  value,
  force = false,
  symbolic = false
}) {
  try {
    assertParameter("fs", _fs);
    assertParameter("gitdir", gitdir);
    assertParameter("ref", ref);
    assertParameter("value", value);
    const fs = new FileSystem(_fs);
    if (ref !== import_clean_git_ref.default.clean(ref)) {
      throw new InvalidRefNameError(ref, import_clean_git_ref.default.clean(ref));
    }
    if (!force && await GitRefManager.exists({ fs, gitdir, ref })) {
      throw new AlreadyExistsError("ref", ref);
    }
    if (symbolic) {
      await GitRefManager.writeSymbolicRef({
        fs,
        ref,
        value
    } else {
      value = await GitRefManager.resolve({
        ref: value
      });
      await GitRefManager.writeRef({
        fs,
        gitdir,
        ref,
        value
  } catch (err) {
    err.caller = "git.writeRef";
    throw err;
  }
async function _writeTag({ fs, gitdir, tag: tag2 }) {
  const object = GitAnnotatedTag.from(tag2).toObject();
  const oid = await _writeObject({
    fs,
    gitdir,
    type: "tag",
    object,
    format: "content"
  return oid;
async function writeTag({ fs, dir, gitdir = join(dir, ".git"), tag: tag2 }) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("tag", tag2);
    return await _writeTag({
      fs: new FileSystem(fs),
      tag: tag2
  } catch (err) {
    err.caller = "git.writeTag";
    throw err;
  }
async function writeTree({ fs, dir, gitdir = join(dir, ".git"), tree }) {
  try {
    assertParameter("fs", fs);
    assertParameter("gitdir", gitdir);
    assertParameter("tree", tree);
    return await _writeTree({
      fs: new FileSystem(fs),
      gitdir,
      tree
    });
  } catch (err) {
    err.caller = "git.writeTree";
    throw err;
  }
// src/main.ts
var import_obsidian23 = __toModule(require("obsidian"));
// src/promiseQueue.ts
var PromiseQueue = class {
  constructor() {
    this.tasks = [];
  addTask(task) {
    this.tasks.push(task);
    if (this.tasks.length === 1) {
      this.handleTask();
  async handleTask() {
    if (this.tasks.length > 0) {
      this.tasks[0]().finally(() => {
        this.tasks.shift();
        this.handleTask();
      });
// src/settings.ts
var import_obsidian7 = __toModule(require("obsidian"));

// src/isomorphicGit.ts
init_polyfill_buffer();

// node_modules/diff/lib/index.mjs
init_polyfill_buffer();
function Diff() {
}
Diff.prototype = {
  diff: function diff(oldString, newString) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var callback = options.callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    this.options = options;
    var self3 = this;
    function done(value) {
      if (callback) {
        setTimeout(function() {
          callback(void 0, value);
        }, 0);
        return true;
        return value;
      }
    }
    oldString = this.castInput(oldString);
    newString = this.castInput(newString);
    oldString = this.removeEmpty(this.tokenize(oldString));
    newString = this.removeEmpty(this.tokenize(newString));
    var newLen = newString.length, oldLen = oldString.length;
    var editLength = 1;
    var maxEditLength = newLen + oldLen;
    if (options.maxEditLength) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    var bestPath = [{
      newPos: -1,
      components: []
    }];
    var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);
    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
      return done([{
        value: this.join(newString),
        count: newString.length
      }]);
    }
    function execEditLength() {
      for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
        var basePath = void 0;
        var addPath = bestPath[diagonalPath - 1], removePath = bestPath[diagonalPath + 1], _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;
        if (addPath) {
          bestPath[diagonalPath - 1] = void 0;
        var canAdd = addPath && addPath.newPos + 1 < newLen, canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = void 0;
          continue;
        if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
          basePath = clonePath(removePath);
          self3.pushComponent(basePath.components, void 0, true);
          basePath = addPath;
          basePath.newPos++;
          self3.pushComponent(basePath.components, true, void 0);
        _oldPos = self3.extractCommon(basePath, newString, oldString, diagonalPath);
        if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
          return done(buildValues(self3, basePath.components, newString, oldString, self3.useLongestToken));
          bestPath[diagonalPath] = basePath;
      editLength++;
    }
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength) {
            return callback();
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength) {
        var ret = execEditLength();
        if (ret) {
          return ret;
    }
  },
  pushComponent: function pushComponent(components, added, removed) {
    var last2 = components[components.length - 1];
    if (last2 && last2.added === added && last2.removed === removed) {
      components[components.length - 1] = {
        count: last2.count + 1,
        added,
        removed
      };
    } else {
      components.push({
        count: 1,
        added,
        removed
      });
    }
  },
  extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
    var newLen = newString.length, oldLen = oldString.length, newPos = basePath.newPos, oldPos = newPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
      newPos++;
      oldPos++;
      commonCount++;
    }
    if (commonCount) {
      basePath.components.push({
        count: commonCount
      });
    }
    basePath.newPos = newPos;
    return oldPos;
  },
  equals: function equals(left, right) {
    if (this.options.comparator) {
      return this.options.comparator(left, right);
    } else {
      return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  },
  removeEmpty: function removeEmpty(array) {
    var ret = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  },
  castInput: function castInput(value) {
    return value;
  },
  tokenize: function tokenize(value) {
    return value.split("");
  },
  join: function join2(chars) {
    return chars.join("");
  }
};
function buildValues(diff2, components, newString, oldString, useLongestToken) {
  var componentPos = 0, componentLen = components.length, newPos = 0, oldPos = 0;
  for (; componentPos < componentLen; componentPos++) {
    var component = components[componentPos];
    if (!component.removed) {
      if (!component.added && useLongestToken) {
        var value = newString.slice(newPos, newPos + component.count);
        value = value.map(function(value2, i) {
          var oldValue = oldString[oldPos + i];
          return oldValue.length > value2.length ? oldValue : value2;
        });
        component.value = diff2.join(value);
        component.value = diff2.join(newString.slice(newPos, newPos + component.count));
      newPos += component.count;
      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = diff2.join(oldString.slice(oldPos, oldPos + component.count));
      oldPos += component.count;
      if (componentPos && components[componentPos - 1].added) {
        var tmp = components[componentPos - 1];
        components[componentPos - 1] = components[componentPos];
        components[componentPos] = tmp;
      }
    }
  var lastComponent = components[componentLen - 1];
  if (componentLen > 1 && typeof lastComponent.value === "string" && (lastComponent.added || lastComponent.removed) && diff2.equals("", lastComponent.value)) {
    components[componentLen - 2].value += lastComponent.value;
    components.pop();
  return components;
}
function clonePath(path2) {
  return {
    newPos: path2.newPos,
    components: path2.components.slice(0)
  };
}
var characterDiff = new Diff();
function diffChars(oldStr, newStr, options) {
  return characterDiff.diff(oldStr, newStr, options);
}
var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
var reWhitespace = /\S/;
var wordDiff = new Diff();
wordDiff.equals = function(left, right) {
  if (this.options.ignoreCase) {
    left = left.toLowerCase();
    right = right.toLowerCase();
  return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
};
wordDiff.tokenize = function(value) {
  var tokens = value.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/);
  for (var i = 0; i < tokens.length - 1; i++) {
    if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
      tokens[i] += tokens[i + 2];
      tokens.splice(i + 1, 2);
      i--;
    }
  return tokens;
};
function diffWordsWithSpace(oldStr, newStr, options) {
  return wordDiff.diff(oldStr, newStr, options);
}
var lineDiff = new Diff();
lineDiff.tokenize = function(value) {
  var retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  for (var i = 0; i < linesAndNewlines.length; i++) {
    var line = linesAndNewlines[i];
    if (i % 2 && !this.options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      if (this.options.ignoreWhitespace) {
        line = line.trim();
      retLines.push(line);
    }
  return retLines;
function diffLines(oldStr, newStr, callback) {
  return lineDiff.diff(oldStr, newStr, callback);
}
var sentenceDiff = new Diff();
sentenceDiff.tokenize = function(value) {
  return value.split(/(\S.+?[.!?])(?=\s+|$)/);
};
var cssDiff = new Diff();
cssDiff.tokenize = function(value) {
  return value.split(/([{}:;,]|\s+)/);
};
function _typeof(obj) {
  "@babel/helpers - typeof";
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function(obj2) {
      return typeof obj2;
    };
    _typeof = function(obj2) {
      return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    };
  return _typeof(obj);
}
function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr))
    return _arrayLikeToArray(arr);
}
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
    return Array.from(iter);
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o)
    return;
  if (typeof o === "string")
    return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor)
    n = o.constructor.name;
  if (n === "Map" || n === "Set")
    return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length)
    len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++)
    arr2[i] = arr[i];
  return arr2;
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
var objectPrototypeToString = Object.prototype.toString;
var jsonDiff = new Diff();
jsonDiff.useLongestToken = true;
jsonDiff.tokenize = lineDiff.tokenize;
jsonDiff.castInput = function(value) {
  var _this$options = this.options, undefinedReplacement = _this$options.undefinedReplacement, _this$options$stringi = _this$options.stringifyReplacer, stringifyReplacer = _this$options$stringi === void 0 ? function(k, v) {
    return typeof v === "undefined" ? undefinedReplacement : v;
  } : _this$options$stringi;
  return typeof value === "string" ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, "  ");
jsonDiff.equals = function(left, right) {
  return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, "$1"), right.replace(/,([\r\n])/g, "$1"));
};
function canonicalize(obj, stack, replacementStack, replacer, key2) {
  stack = stack || [];
  replacementStack = replacementStack || [];
  if (replacer) {
    obj = replacer(key2, obj);
  var i;
  for (i = 0; i < stack.length; i += 1) {
    if (stack[i] === obj) {
      return replacementStack[i];
    }
  var canonicalizedObj;
  if (objectPrototypeToString.call(obj) === "[object Array]") {
    stack.push(obj);
    canonicalizedObj = new Array(obj.length);
    replacementStack.push(canonicalizedObj);
    for (i = 0; i < obj.length; i += 1) {
      canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key2);
    }
    stack.pop();
    replacementStack.pop();
    return canonicalizedObj;
  if (obj && obj.toJSON) {
    obj = obj.toJSON();
  if (_typeof(obj) === "object" && obj !== null) {
    stack.push(obj);
    canonicalizedObj = {};
    replacementStack.push(canonicalizedObj);
    var sortedKeys = [], _key;
    for (_key in obj) {
      if (obj.hasOwnProperty(_key)) {
        sortedKeys.push(_key);
    }
    sortedKeys.sort();
    for (i = 0; i < sortedKeys.length; i += 1) {
      _key = sortedKeys[i];
      canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
    }
    stack.pop();
    replacementStack.pop();
  } else {
    canonicalizedObj = obj;
  return canonicalizedObj;
}
var arrayDiff = new Diff();
arrayDiff.tokenize = function(value) {
  return value.slice();
};
arrayDiff.join = arrayDiff.removeEmpty = function(value) {
  return value;
};
function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  if (!options) {
    options = {};
  if (typeof options.context === "undefined") {
    options.context = 4;
  var diff2 = diffLines(oldStr, newStr, options);
  if (!diff2) {
    return;
  diff2.push({
    value: "",
    lines: []
  });
  function contextLines(lines) {
    return lines.map(function(entry) {
      return " " + entry;
    });
  }
  var hunks = [];
  var oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
  var _loop = function _loop2(i2) {
    var current = diff2[i2], lines = current.lines || current.value.replace(/\n$/, "").split("\n");
    current.lines = lines;
    if (current.added || current.removed) {
      var _curRange;
      if (!oldRangeStart) {
        var prev = diff2[i2 - 1];
        oldRangeStart = oldLine;
        newRangeStart = newLine;
        if (prev) {
          curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
          oldRangeStart -= curRange.length;
          newRangeStart -= curRange.length;
        }
      }
      (_curRange = curRange).push.apply(_curRange, _toConsumableArray(lines.map(function(entry) {
        return (current.added ? "+" : "-") + entry;
      })));
      if (current.added) {
        newLine += lines.length;
      } else {
        oldLine += lines.length;
    } else {
      if (oldRangeStart) {
        if (lines.length <= options.context * 2 && i2 < diff2.length - 2) {
          var _curRange2;
          (_curRange2 = curRange).push.apply(_curRange2, _toConsumableArray(contextLines(lines)));
          var _curRange3;
          var contextSize = Math.min(lines.length, options.context);
          (_curRange3 = curRange).push.apply(_curRange3, _toConsumableArray(contextLines(lines.slice(0, contextSize))));
          var hunk = {
            oldStart: oldRangeStart,
            oldLines: oldLine - oldRangeStart + contextSize,
            newStart: newRangeStart,
            newLines: newLine - newRangeStart + contextSize,
            lines: curRange
          };
          if (i2 >= diff2.length - 2 && lines.length <= options.context) {
            var oldEOFNewline = /\n$/.test(oldStr);
            var newEOFNewline = /\n$/.test(newStr);
            var noNlBeforeAdds = lines.length == 0 && curRange.length > hunk.oldLines;
            if (!oldEOFNewline && noNlBeforeAdds && oldStr.length > 0) {
              curRange.splice(hunk.oldLines, 0, "\\ No newline at end of file");
            }
            if (!oldEOFNewline && !noNlBeforeAdds || !newEOFNewline) {
              curRange.push("\\ No newline at end of file");
            }
          }
          hunks.push(hunk);
          oldRangeStart = 0;
          newRangeStart = 0;
          curRange = [];
      oldLine += lines.length;
      newLine += lines.length;
    }
  };
  for (var i = 0; i < diff2.length; i++) {
    _loop(i);
  return {
    oldFileName,
    newFileName,
    oldHeader,
    newHeader,
    hunks
  };
}
function formatPatch(diff2) {
  var ret = [];
  if (diff2.oldFileName == diff2.newFileName) {
    ret.push("Index: " + diff2.oldFileName);
  ret.push("===================================================================");
  ret.push("--- " + diff2.oldFileName + (typeof diff2.oldHeader === "undefined" ? "" : "	" + diff2.oldHeader));
  ret.push("+++ " + diff2.newFileName + (typeof diff2.newHeader === "undefined" ? "" : "	" + diff2.newHeader));
  for (var i = 0; i < diff2.hunks.length; i++) {
    var hunk = diff2.hunks[i];
    if (hunk.oldLines === 0) {
      hunk.oldStart -= 1;
    if (hunk.newLines === 0) {
      hunk.newStart -= 1;
    ret.push("@@ -" + hunk.oldStart + "," + hunk.oldLines + " +" + hunk.newStart + "," + hunk.newLines + " @@");
    ret.push.apply(ret, hunk.lines);
  return ret.join("\n") + "\n";
}
function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  return formatPatch(structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options));
}
function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
  return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
}

// src/isomorphicGit.ts
var import_obsidian5 = __toModule(require("obsidian"));

// src/gitManager.ts
init_polyfill_buffer();
var GitManager = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.app = plugin.app;
  getVaultPath(path2) {
    if (this.plugin.settings.basePath) {
      return this.plugin.settings.basePath + "/" + path2;
    } else {
      return path2;
    }
  getPath(path2, relativeToVault) {
    return relativeToVault && this.plugin.settings.basePath.length > 0 ? path2.substring(this.plugin.settings.basePath.length + 1) : path2;
  _getTreeStructure(children2, beginLength = 0) {
    const list = [];
    children2 = [...children2];
    while (children2.length > 0) {
      const first2 = children2.first();
      const restPath = first2.path.substring(beginLength);
      if (restPath.contains("/")) {
        const title = restPath.substring(0, restPath.indexOf("/"));
        const childrenWithSameTitle = children2.filter((item) => {
          return item.path.substring(beginLength).startsWith(title + "/");
        });
        childrenWithSameTitle.forEach((item) => children2.remove(item));
        const path2 = first2.path.substring(0, restPath.indexOf("/") + beginLength);
        list.push({
          title,
          path: path2,
          vaultPath: this.getVaultPath(path2),
          children: this._getTreeStructure(childrenWithSameTitle, (beginLength > 0 ? beginLength + title.length : title.length) + 1)
        });
      } else {
        list.push({
          title: restPath,
          statusResult: first2,
          path: first2.path,
          vaultPath: this.getVaultPath(first2.path)
        });
        children2.remove(first2);
    }
    return list;
  simplify(tree) {
    var _a2, _b, _c, _d;
    for (const node of tree) {
      while (true) {
        const singleChild = ((_a2 = node.children) == null ? void 0 : _a2.length) == 1;
        const singleChildIsDir = ((_c = (_b = node.children) == null ? void 0 : _b.first()) == null ? void 0 : _c.statusResult) == void 0;
        if (!(node.children != void 0 && singleChild && singleChildIsDir))
          break;
        const child = node.children.first();
        node.title += "/" + child.title;
        node.statusResult = child.statusResult;
        node.path = child.path;
        node.vaultPath = child.vaultPath;
        node.children = child.children;
      }
      if (node.children != void 0) {
        this.simplify(node.children);
      }
      (_d = node.children) == null ? void 0 : _d.sort((a, b) => {
        const dirCompare = (b.statusResult == void 0 ? 1 : 0) - (a.statusResult == void 0 ? 1 : 0);
        if (dirCompare != 0) {
          return dirCompare;
        } else {
          return a.title.localeCompare(b.title);
        }
      });
    }
    return tree.sort((a, b) => {
      const dirCompare = (b.statusResult == void 0 ? 1 : 0) - (a.statusResult == void 0 ? 1 : 0);
      if (dirCompare != 0) {
        return dirCompare;
      } else {
        return a.title.localeCompare(b.title);
  getTreeStructure(children2) {
    const tree = this._getTreeStructure(children2);
    const res = this.simplify(tree);
    return res;
  }
  async formatCommitMessage(template) {
    let status2;
    if (template.includes("{{numFiles}}")) {
      status2 = await this.status();
      const numFiles = status2.staged.length;
      template = template.replace("{{numFiles}}", String(numFiles));
    }
    if (template.includes("{{hostname}}")) {
      const hostname = this.plugin.localStorage.getHostname() || "";
      template = template.replace("{{hostname}}", hostname);
    }
    if (template.includes("{{files}}")) {
      status2 = status2 != null ? status2 : await this.status();
      const changeset = {};
      status2.staged.forEach((value) => {
        if (value.index in changeset) {
          changeset[value.index].push(value.path);
        } else {
          changeset[value.index] = [value.path];
        }
      });
      const chunks = [];
      for (const [action, files2] of Object.entries(changeset)) {
        chunks.push(action + " " + files2.join(" "));
      const files = chunks.join(", ");
      template = template.replace("{{files}}", files);
    }
    const moment = window.moment;
    template = template.replace("{{date}}", moment().format(this.plugin.settings.commitDateFormat));
    if (this.plugin.settings.listChangedFilesInMessageBody) {
      template = template + "\n\nAffected files:\n" + (status2 != null ? status2 : await this.status()).staged.map((e) => e.path).join("\n");
    }
    return template;
};

// src/myAdapter.ts
init_polyfill_buffer();
var import_obsidian2 = __toModule(require("obsidian"));
var MyAdapter = class {
  constructor(vault, plugin) {
    this.plugin = plugin;
    this.promises = {};
    this.adapter = vault.adapter;
    this.vault = vault;
    this.promises.readFile = this.readFile.bind(this);
    this.promises.writeFile = this.writeFile.bind(this);
    this.promises.readdir = this.readdir.bind(this);
    this.promises.mkdir = this.mkdir.bind(this);
    this.promises.rmdir = this.rmdir.bind(this);
    this.promises.stat = this.stat.bind(this);
    this.promises.unlink = this.unlink.bind(this);
    this.promises.lstat = this.lstat.bind(this);
    this.promises.readlink = this.readlink.bind(this);
    this.promises.symlink = this.symlink.bind(this);
  async readFile(path2, opts) {
    var _a2;
    this.maybeLog("Read: " + path2 + JSON.stringify(opts));
    if (opts == "utf8" || opts.encoding == "utf8") {
      const file = this.vault.getAbstractFileByPath(path2);
      if (file instanceof import_obsidian2.TFile) {
        this.maybeLog("Reuse");
        return this.vault.read(file);
      } else {
        return this.adapter.read(path2);
    } else {
      if (path2.endsWith(".git/index")) {
        return (_a2 = this.index) != null ? _a2 : this.adapter.readBinary(path2);
      const file = this.vault.getAbstractFileByPath(path2);
      if (file instanceof import_obsidian2.TFile) {
        this.maybeLog("Reuse");
        return this.vault.readBinary(file);
      } else {
        return this.adapter.readBinary(path2);
    }
  async writeFile(path2, data) {
    this.maybeLog("Write: " + path2);
    if (typeof data === "string") {
      const file = this.vault.getAbstractFileByPath(path2);
      if (file instanceof import_obsidian2.TFile) {
        return this.vault.modify(file, data);
      } else {
        return this.adapter.write(path2, data);
    } else {
      if (path2.endsWith(".git/index")) {
        this.index = data;
        this.indexmtime = Date.now();
      } else {
        const file = this.vault.getAbstractFileByPath(path2);
        if (file instanceof import_obsidian2.TFile) {
          return this.vault.modifyBinary(file, data);
        } else {
          return this.adapter.writeBinary(path2, data);
        }
      }
    }
  async readdir(path2) {
    if (path2 === ".")
      path2 = "/";
    const res = await this.adapter.list(path2);
    const all = [...res.files, ...res.folders];
    let formattedAll;
    if (path2 !== "/") {
      formattedAll = all.map((e) => (0, import_obsidian2.normalizePath)(e.substring(path2.length)));
    } else {
      formattedAll = all;
    }
    return formattedAll;
  async mkdir(path2) {
    return this.adapter.mkdir(path2);
  async rmdir(path2, opts) {
    var _a2, _b;
    return this.adapter.rmdir(path2, (_b = (_a2 = opts == null ? void 0 : opts.options) == null ? void 0 : _a2.recursive) != null ? _b : false);
  async stat(path2) {
    if (path2.endsWith(".git/index")) {
      if (this.index !== void 0 && this.indexctime != void 0 && this.indexmtime != void 0) {
        return {
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false,
          size: this.index.length,
          type: "file",
          ctimeMs: this.indexctime,
          mtimeMs: this.indexmtime
        };
      } else {
        const stat = await this.adapter.stat(path2);
        if (stat == void 0) {
          throw { "code": "ENOENT" };
        }
        this.indexctime = stat.ctime;
        this.indexmtime = stat.mtime;
        return {
          ctimeMs: stat.ctime,
          mtimeMs: stat.mtime,
          size: stat.size,
          type: "file",
          isFile: () => true,
          isDirectory: () => false,
          isSymbolicLink: () => false
        };
      }
    }
    if (path2 === ".")
      path2 = "/";
    const file = this.vault.getAbstractFileByPath(path2);
    this.maybeLog("Stat: " + path2);
    if (file instanceof import_obsidian2.TFile) {
      this.maybeLog("Reuse stat");
      return {
        ctimeMs: file.stat.ctime,
        mtimeMs: file.stat.mtime,
        size: file.stat.size,
        type: "file",
        isFile: () => true,
        isDirectory: () => false,
        isSymbolicLink: () => false
      };
    } else {
      const stat = await this.adapter.stat(path2);
      if (stat) {
        return {
          ctimeMs: stat.ctime,
          mtimeMs: stat.mtime,
          size: stat.size,
          type: stat.type === "folder" ? "directory" : stat.type,
          isFile: () => stat.type === "file",
          isDirectory: () => stat.type === "folder",
          isSymbolicLink: () => false
        };
      } else {
        throw { "code": "ENOENT" };
      }
    }
  async unlink(path2) {
    return this.adapter.remove(path2);
  async lstat(path2) {
    return this.stat(path2);
  async readlink(path2) {
    throw new Error(`readlink of (${path2}) is not implemented.`);
  async symlink(path2) {
    throw new Error(`symlink of (${path2}) is not implemented.`);
  async saveAndClear() {
    if (this.index !== void 0) {
      await this.adapter.writeBinary(this.plugin.gitManager.getVaultPath(".git/index"), this.index, {
        ctime: this.indexctime,
        mtime: this.indexmtime
    }
    this.index = void 0;
    this.indexctime = void 0;
    this.indexmtime = void 0;
  maybeLog(text2) {
  }
};

// src/types.ts
init_polyfill_buffer();
var PluginState;
(function(PluginState2) {
  PluginState2[PluginState2["idle"] = 0] = "idle";
  PluginState2[PluginState2["status"] = 1] = "status";
  PluginState2[PluginState2["pull"] = 2] = "pull";
  PluginState2[PluginState2["add"] = 3] = "add";
  PluginState2[PluginState2["commit"] = 4] = "commit";
  PluginState2[PluginState2["push"] = 5] = "push";
  PluginState2[PluginState2["conflicted"] = 6] = "conflicted";
})(PluginState || (PluginState = {}));
var FileType;
(function(FileType2) {
  FileType2[FileType2["staged"] = 0] = "staged";
  FileType2[FileType2["changed"] = 1] = "changed";
  FileType2[FileType2["pulled"] = 2] = "pulled";
})(FileType || (FileType = {}));

// src/ui/modals/generalModal.ts
init_polyfill_buffer();
var import_obsidian3 = __toModule(require("obsidian"));
var generalModalConfigDefaults = {
  options: [],
  placeholder: "",
  allowEmpty: false,
  onlySelection: false,
  initialValue: void 0
};
var GeneralModal = class extends import_obsidian3.SuggestModal {
  constructor(config) {
    super(app);
    this.config = { ...generalModalConfigDefaults, ...config };
    this.setPlaceholder(this.config.placeholder);
  open() {
    super.open();
    if (this.config.initialValue != void 0) {
      this.inputEl.value = this.config.initialValue;
      this.inputEl.dispatchEvent(new Event("input"));
    }
    return new Promise((resolve) => {
      this.resolve = resolve;
  selectSuggestion(value, evt) {
    if (this.resolve) {
      let res;
      if (this.config.allowEmpty && value === " ")
        res = "";
      else if (value === "...")
        res = void 0;
      else
        res = value;
      this.resolve(res);
    }
    super.selectSuggestion(value, evt);
  onClose() {
    if (this.resolve)
      this.resolve(void 0);
  }
  getSuggestions(query) {
    if (this.config.onlySelection) {
      return this.config.options;
    } else if (this.config.allowEmpty) {
      return [query.length > 0 ? query : " ", ...this.config.options];
    } else {
      return [query.length > 0 ? query : "...", ...this.config.options];
  renderSuggestion(value, el) {
    el.setText(value);
  onChooseSuggestion(item, evt) {
};
// src/utils.ts
var worthWalking2 = (filepath, root) => {
  if (filepath === "." || root == null || root.length === 0 || root === ".") {
    return true;
  }
  if (root.length >= filepath.length) {
    return root.startsWith(filepath);
  } else {
    return filepath.startsWith(root);
function getNewLeaf(event) {
  let leaf;
  if (event) {
    if (event.button === 0 || event.button === 1) {
      const type = import_obsidian4.Keymap.isModEvent(event);
      leaf = app.workspace.getLeaf(type);
    }
  } else {
    leaf = app.workspace.getLeaf(false);
  }
  return leaf;
}

// src/isomorphicGit.ts
var IsomorphicGit = class extends GitManager {
  constructor(plugin) {
    super(plugin);
    this.FILE = 0;
    this.HEAD = 1;
    this.WORKDIR = 2;
    this.STAGE = 3;
    this.status_mapping = {
      "000": "  ",
      "003": "AD",
      "020": "??",
      "022": "A ",
      "023": "AM",
      "100": "D ",
      "101": " D",
      "103": "MD",
      "110": "DA",
      "111": "  ",
      "120": "DA",
      "121": " M",
      "122": "M ",
      "123": "MM"
    this.noticeLength = 999999;
    this.fs = new MyAdapter(this.app.vault, this.plugin);
  }
  getRepo() {
    return {
      fs: this.fs,
      dir: this.plugin.settings.basePath,
      onAuth: () => {
        var _a2, _b;
        return {
          username: (_a2 = this.plugin.localStorage.getUsername()) != null ? _a2 : void 0,
          password: (_b = this.plugin.localStorage.getPassword()) != null ? _b : void 0
        };
      },
      onAuthFailure: async () => {
        new import_obsidian5.Notice("Authentication failed. Please try with different credentials");
        const username = await new GeneralModal({ placeholder: "Specify your username" }).open();
        if (username) {
          const password = await new GeneralModal({ placeholder: "Specify your password/personal access token" }).open();
          if (password) {
            this.plugin.localStorage.setUsername(username);
            this.plugin.localStorage.setPassword(password);
            return {
              username,
              password
            };
          }
        }
        return { cancel: true };
      },
      http: {
        async request({
          url,
          method,
          headers,
          body
        }) {
          if (body) {
            body = await collect2(body);
            body = body.buffer;
          }
          const res = await (0, import_obsidian5.requestUrl)({ url, method, headers, body, throw: false });
          return {
            url,
            method,
            headers: res.headers,
            body: [new Uint8Array(res.arrayBuffer)],
            statusCode: res.status,
            statusMessage: res.status.toString()
          };
        }
  }
  async wrapFS(call) {
    try {
      const res = await call;
      await this.fs.saveAndClear();
      return res;
    } catch (error) {
      await this.fs.saveAndClear();
      throw error;
    }
  }
  async status() {
    let notice;
    const timeout = window.setTimeout(function() {
      notice = new import_obsidian5.Notice("This takes longer: Getting status", this.noticeLength);
    }, 2e4);
    try {
      this.plugin.setState(PluginState.status);
      const status2 = (await this.wrapFS(isomorphic_git_default.statusMatrix({ ...this.getRepo() }))).map((row) => this.getFileStatusResult(row));
      const changed = status2.filter((fileStatus) => fileStatus.working_dir !== " ");
      const staged = status2.filter((fileStatus) => fileStatus.index !== " " && fileStatus.index !== "U");
      const conflicted = [];
      window.clearTimeout(timeout);
      notice == null ? void 0 : notice.hide();
      return { changed, staged, conflicted };
    } catch (error) {
      window.clearTimeout(timeout);
      notice == null ? void 0 : notice.hide();
      this.plugin.displayError(error);
      throw error;
    }
  }
  async commitAll({ message, status: status2, unstagedFiles }) {
    try {
      await this.stageAll({ status: status2, unstagedFiles });
      return this.commit(message);
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  }
  async commit(message) {
    try {
      this.plugin.setState(PluginState.commit);
      const formatMessage = await this.formatCommitMessage(message);
      const hadConflict = this.plugin.localStorage.getConflict() === "true";
      let parent = void 0;
      if (hadConflict) {
        const branchInfo = await this.branchInfo();
        parent = [branchInfo.current, branchInfo.tracking];
      }
      await this.wrapFS(isomorphic_git_default.commit({
        ...this.getRepo(),
        message: formatMessage,
        parent
      }));
      this.plugin.localStorage.setConflict("false");
      return;
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  }
  async stage(filepath, relativeToVault) {
    const gitPath = this.getPath(filepath, relativeToVault);
    let vaultPath;
    if (relativeToVault) {
      vaultPath = filepath;
    } else {
      vaultPath = this.getVaultPath(filepath);
    }
    try {
      this.plugin.setState(PluginState.add);
      if (await this.app.vault.adapter.exists(vaultPath)) {
        await this.wrapFS(isomorphic_git_default.add({ ...this.getRepo(), filepath: gitPath }));
      } else {
        await this.wrapFS(isomorphic_git_default.remove({ ...this.getRepo(), filepath: gitPath }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async stageAll({ dir, status: status2, unstagedFiles }) {
    try {
      if (status2) {
        await Promise.all(status2.changed.map((file) => file.working_dir !== "D" ? this.wrapFS(isomorphic_git_default.add({ ...this.getRepo(), filepath: file.path })) : isomorphic_git_default.remove({ ...this.getRepo(), filepath: file.path })));
      } else {
        const filesToStage = unstagedFiles != null ? unstagedFiles : await this.getUnstagedFiles(dir != null ? dir : ".");
        await Promise.all(filesToStage.map(({ filepath, deleted }) => deleted ? isomorphic_git_default.remove({ ...this.getRepo(), filepath }) : this.wrapFS(isomorphic_git_default.add({ ...this.getRepo(), filepath }))));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async unstage(filepath, relativeToVault) {
    try {
      this.plugin.setState(PluginState.add);
      filepath = this.getPath(filepath, relativeToVault);
      await this.wrapFS(isomorphic_git_default.resetIndex({ ...this.getRepo(), filepath }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  }
  async unstageAll({ dir, status: status2 }) {
    try {
      let staged;
      if (status2) {
        staged = status2.staged.map((file) => file.path);
      } else {
        const res = await this.getStagedFiles(dir != null ? dir : ".");
        staged = res.map(({ filepath }) => filepath);
      await this.wrapFS(Promise.all(staged.map((file) => isomorphic_git_default.resetIndex({ ...this.getRepo(), filepath: file }))));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async discard(filepath) {
    try {
      this.plugin.setState(PluginState.add);
      await this.wrapFS(isomorphic_git_default.checkout({ ...this.getRepo(), filepaths: [filepath], force: true }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async discardAll({ dir, status: status2 }) {
    let files = [];
    if (status2) {
      if (dir != void 0) {
        files = status2.changed.filter((file) => file.path.startsWith(dir)).map((file) => file.path);
      } else {
        files = status2.changed.map((file) => file.path);
      }
    } else {
      files = (await this.getUnstagedFiles(dir)).map(({ filepath }) => filepath);
    }
    try {
      await this.wrapFS(isomorphic_git_default.checkout({ ...this.getRepo(), filepaths: files, force: true }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  getProgressText(action, event) {
    let out = `${action} progress:`;
    if (event.phase) {
      out = `${out} ${event.phase}:`;
    if (event.loaded) {
      out = `${out} ${event.loaded}`;
      if (event.total) {
        out = `${out} of ${event.total}`;
      }
    return out;
  resolveRef(ref) {
    return this.wrapFS(isomorphic_git_default.resolveRef({ ...this.getRepo(), ref }));
  async pull() {
    const progressNotice = this.showNotice("Initializing pull");
    try {
      this.plugin.setState(PluginState.pull);
      const localCommit = await this.resolveRef("HEAD");
      await this.fetch();
      const branchInfo = await this.branchInfo();
      await this.wrapFS(isomorphic_git_default.merge({
        ...this.getRepo(),
        ours: branchInfo.current,
        theirs: branchInfo.tracking,
        abortOnConflict: false
      }));
      await this.wrapFS(isomorphic_git_default.checkout({
        ...this.getRepo(),
        ref: branchInfo.current,
        onProgress: (progress) => {
          if (progressNotice !== void 0) {
            progressNotice.noticeEl.innerText = this.getProgressText("Checkout", progress);
          }
        },
        remote: branchInfo.remote
      }));
      progressNotice == null ? void 0 : progressNotice.hide();
      const upstreamCommit = await this.resolveRef("HEAD");
      this.plugin.lastUpdate = Date.now();
      const changedFiles = await this.getFileChangesCount(localCommit, upstreamCommit);
      this.showNotice("Finished pull", false);
      return changedFiles.map((file) => ({
        path: file.path,
        working_dir: "P",
        index: "P",
        vault_path: this.getVaultPath(file.path)
      }));
    } catch (error) {
      progressNotice == null ? void 0 : progressNotice.hide();
      if (error instanceof Errors.MergeConflictError) {
        this.plugin.handleConflict(error.data.filepaths.map((file) => this.getVaultPath(file)));
      }
      this.plugin.displayError(error);
      throw error;
  async push() {
    if (!await this.canPush()) {
      return 0;
    }
    const progressNotice = this.showNotice("Initializing push");
    try {
      this.plugin.setState(PluginState.status);
      const status2 = await this.branchInfo();
      const trackingBranch = status2.tracking;
      const currentBranch2 = status2.current;
      const numChangedFiles = (await this.getFileChangesCount(currentBranch2, trackingBranch)).length;
      this.plugin.setState(PluginState.push);
      await this.wrapFS(isomorphic_git_default.push({
        ...this.getRepo(),
        onProgress: (progress) => {
          if (progressNotice !== void 0) {
            progressNotice.noticeEl.innerText = this.getProgressText("Pushing", progress);
          }
        }
      }));
      progressNotice == null ? void 0 : progressNotice.hide();
      return numChangedFiles;
    } catch (error) {
      progressNotice == null ? void 0 : progressNotice.hide();
      this.plugin.displayError(error);
      throw error;
    }
  }
  async canPush() {
    const status2 = await this.branchInfo();
    const trackingBranch = status2.tracking;
    const currentBranch2 = status2.current;
    const current = await this.resolveRef(currentBranch2);
    const tracking = await this.resolveRef(trackingBranch);
    return current != tracking;
  }
  async checkRequirements() {
    const headExists = await this.plugin.app.vault.adapter.exists(`${this.getRepo().dir}/.git/HEAD`);
    return headExists ? "valid" : "missing-repo";
  }
  async branchInfo() {
    var _a2, _b;
    try {
      const current = await isomorphic_git_default.currentBranch(this.getRepo()) || "";
      const branches = await isomorphic_git_default.listBranches(this.getRepo());
      const remote = (_a2 = await this.getConfig(`branch.${current}.remote`)) != null ? _a2 : "origin";
      const trackingBranch = (_b = await this.getConfig(`branch.${current}.merge`)) == null ? void 0 : _b.split("refs/heads")[1];
      const tracking = trackingBranch ? remote + trackingBranch : void 0;
      return {
        current,
        tracking,
        branches,
        remote
      };
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async getCurrentRemote() {
    var _a2;
    const current = await isomorphic_git_default.currentBranch(this.getRepo()) || "";
    const remote = (_a2 = await this.getConfig(`branch.${current}.remote`)) != null ? _a2 : "origin";
    return remote;
  async checkout(branch2) {
    try {
      return this.wrapFS(isomorphic_git_default.checkout({
        ...this.getRepo(),
        ref: branch2
      }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async createBranch(branch2) {
    try {
      await this.wrapFS(isomorphic_git_default.branch({ ...this.getRepo(), ref: branch2, checkout: true }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async deleteBranch(branch2) {
    try {
      await this.wrapFS(isomorphic_git_default.deleteBranch({ ...this.getRepo(), ref: branch2 }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async branchIsMerged(branch2) {
    return true;
  async init() {
    try {
      await this.wrapFS(isomorphic_git_default.init(this.getRepo()));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async clone(url, dir) {
    const progressNotice = this.showNotice("Initializing clone");
    try {
      await this.wrapFS(isomorphic_git_default.clone({
        ...this.getRepo(),
        dir,
        url,
        onProgress: (progress) => {
          if (progressNotice !== void 0) {
            progressNotice.noticeEl.innerText = this.getProgressText("Cloning", progress);
      }));
      progressNotice == null ? void 0 : progressNotice.hide();
    } catch (error) {
      progressNotice == null ? void 0 : progressNotice.hide();
      this.plugin.displayError(error);
      throw error;
    }
  async setConfig(path2, value) {
    try {
      return this.wrapFS(isomorphic_git_default.setConfig({
        ...this.getRepo(),
        path: path2,
        value
      }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async getConfig(path2) {
    try {
      return this.wrapFS(isomorphic_git_default.getConfig({
        ...this.getRepo(),
        path: path2
      }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
    }
  async fetch(remote) {
    const progressNotice = this.showNotice("Initializing fetch");
    try {
      const args = {
        ...this.getRepo(),
        onProgress: (progress) => {
          if (progressNotice !== void 0) {
            progressNotice.noticeEl.innerText = this.getProgressText("Fetching", progress);
          }
        },
        remote: remote != null ? remote : await this.getCurrentRemote()
      };
      await this.wrapFS(isomorphic_git_default.fetch(args));
      progressNotice == null ? void 0 : progressNotice.hide();
    } catch (error) {
      this.plugin.displayError(error);
      progressNotice == null ? void 0 : progressNotice.hide();
      throw error;
  }
  async setRemote(name, url) {
    try {
      await this.wrapFS(isomorphic_git_default.addRemote({ ...this.getRepo(), remote: name, url, force: true }));
    } catch (error) {
      this.plugin.displayError(error);
      throw error;
  async getRemoteBranches(remote) {
    let remoteBranches = [];
    remoteBranches.push(...await this.wrapFS(isomorphic_git_default.listBranches({ ...this.getRepo(), remote })));
    remoteBranches.remove("HEAD");
    remoteBranches = remoteBranches.map((e) => `${remote}/${e}`);
    return remoteBranches;
  async getRemotes() {
    return (await this.wrapFS(isomorphic_git_default.listRemotes({ ...this.getRepo() }))).map((remoteUrl) => remoteUrl.remote);
  async removeRemote(remoteName) {
    await this.wrapFS(isomorphic_git_default.deleteRemote({ ...this.getRepo(), remote: remoteName }));
  }
  async getRemoteUrl(remote) {
    var _a2;
    return (_a2 = (await this.wrapFS(isomorphic_git_default.listRemotes({ ...this.getRepo() }))).filter((item) => item.remote == remote)[0]) == null ? void 0 : _a2.url;
  }
  updateBasePath(basePath) {
    this.getRepo().dir = basePath;
  }
  async updateUpstreamBranch(remoteBranch) {
    const [remote, branch2] = remoteBranch.split("/");
    const branchInfo = await this.branchInfo();
    await this.setConfig(`branch.${branchInfo.current}.merge`, `refs/heads/${branch2}`);
    await this.setConfig(`branch.${branch2}.remote`, remote);
  }
  updateGitPath(gitPath) {
    return;
  }
  async getFileChangesCount(commitHash1, commitHash2) {
    return this.walkDifference({ walkers: [isomorphic_git_default.TREE({ ref: commitHash1 }), isomorphic_git_default.TREE({ ref: commitHash2 })] });
  }
  async walkDifference({ walkers, dir: base }) {
    const res = await this.wrapFS(isomorphic_git_default.walk({
      ...this.getRepo(),
      trees: walkers,
      map: async function(filepath, [A, B]) {
        if (!worthWalking2(filepath, base)) {
          return null;
        }
        if (await (A == null ? void 0 : A.type()) === "tree" || await (B == null ? void 0 : B.type()) === "tree") {
        const Aoid = await (A == null ? void 0 : A.oid());
        const Boid = await (B == null ? void 0 : B.oid());
        let type = "equal";
        if (Aoid !== Boid) {
          type = "modify";
        }
        if (Aoid === void 0) {
          type = "add";
        }
        if (Boid === void 0) {
          type = "remove";
        }
        if (Aoid === void 0 && Boid === void 0) {
          console.log("Something weird happened:");
          console.log(A);
          console.log(B);
        }
        if (type === "equal") {
          return;
        }
        return {
          path: filepath,
          type
        };
      }
    }));
    return res;
  }
  async getStagedFiles(dir = ".") {
    const res = await this.walkDifference({
      walkers: [isomorphic_git_default.TREE({ ref: "HEAD" }), isomorphic_git_default.STAGE()],
      dir
    });
    return res.map((file) => {
      return {
        vault_path: this.getVaultPath(file.path),
        filepath: file.path
    });
  }
  async getUnstagedFiles(base = ".") {
    let notice;
    const timeout = window.setTimeout(function() {
      notice = new import_obsidian5.Notice("This takes longer: Getting status", this.noticeLength);
    }, 2e4);
    try {
      const repo = this.getRepo();
      const res = await this.wrapFS(isomorphic_git_default.walk({
        ...repo,
        trees: [isomorphic_git_default.WORKDIR(), isomorphic_git_default.STAGE()],
        map: async function(filepath, [workdir, stage]) {
          if (!stage && workdir) {
            const isIgnored2 = await isomorphic_git_default.isIgnored({
              ...repo,
              filepath
            });
            if (isIgnored2) {
              return null;
            }
          }
          if (!worthWalking2(filepath, base)) {
            return null;
          }
          const [workdirType, stageType] = await Promise.all([
            workdir && workdir.type(),
            stage && stage.type()
          ]);
          const isBlob = [workdirType, stageType].includes("blob");
          if ((workdirType === "tree" || workdirType === "special") && !isBlob)
            return;
          if (stageType === "commit")
            return null;
          if ((stageType === "tree" || stageType === "special") && !isBlob)
            return;
          const stageOid = stageType === "blob" ? await stage.oid() : void 0;
          let workdirOid;
          if (workdirType === "blob" && stageType !== "blob") {
            workdirOid = "42";
          } else if (workdirType === "blob") {
            workdirOid = await workdir.oid();
          }
          if (!workdirOid) {
            return {
              filepath,
              deleted: true
            };
          }
          if (workdirOid !== stageOid) {
            return {
              filepath,
              deleted: false
            };
          }
          return null;
        }
      }));
      window.clearTimeout(timeout);
      notice == null ? void 0 : notice.hide();
      return res;
    } catch (error) {
      window.clearTimeout(timeout);
      notice == null ? void 0 : notice.hide();
      this.plugin.displayError(error);
      throw error;
    }
  }
  async getDiffString(filePath, stagedChanges = false) {
    const map = async (file, [A]) => {
      if (filePath == file) {
        const oid = await A.oid();
        const contents = await isomorphic_git_default.readBlob({ ...this.getRepo(), oid });
        return contents.blob;
      }
    };
    const stagedBlob = (await isomorphic_git_default.walk({
      ...this.getRepo(),
      trees: [isomorphic_git_default.STAGE()],
      map
    })).first();
    const stagedContent = new TextDecoder().decode(stagedBlob);
    if (stagedChanges) {
      const headBlob = await readBlob({ ...this.getRepo(), filepath: filePath, oid: await this.resolveRef("HEAD") });
      const headContent = new TextDecoder().decode(headBlob.blob);
      const diff2 = createPatch(filePath, headContent, stagedContent);
      return diff2;
    } else {
      let workdirContent;
      if (await app.vault.adapter.exists(filePath)) {
        workdirContent = await app.vault.adapter.read(filePath);
      } else {
        workdirContent = "";
      }
      const diff2 = createPatch(filePath, stagedContent, workdirContent);
      return diff2;
  async getLastCommitTime() {
    const repo = this.getRepo();
    const oid = await this.resolveRef("HEAD");
    const commit2 = await isomorphic_git_default.readCommit({ ...repo, oid });
    const date = commit2.commit.committer.timestamp;
    return new Date(date * 1e3);
  getFileStatusResult(row) {
    const status2 = this.status_mapping[`${row[this.HEAD]}${row[this.WORKDIR]}${row[this.STAGE]}`];
    return {
      index: status2[0] == "?" ? "U" : status2[0],
      working_dir: status2[1] == "?" ? "U" : status2[1],
      path: row[this.FILE],
      vault_path: this.getVaultPath(row[this.FILE])
    };
  showNotice(message, infinity = true) {
    if (!this.plugin.settings.disablePopups) {
      return new import_obsidian5.Notice(message, infinity ? this.noticeLength : void 0);
  }
};
function fromValue2(value) {
  let queue = [value];
    next() {
      return Promise.resolve({ done: queue.length === 0, value: queue.pop() });
    },
    return() {
      queue = [];
      return {};
    },
    [Symbol.asyncIterator]() {
      return this;
    }
function getIterator2(iterable) {
  if (iterable[Symbol.asyncIterator]) {
    return iterable[Symbol.asyncIterator]();
  }
  if (iterable[Symbol.iterator]) {
    return iterable[Symbol.iterator]();
  }
  if (iterable.next) {
    return iterable;
  }
  return fromValue2(iterable);
async function forAwait2(iterable, cb) {
  const iter = getIterator2(iterable);
  while (true) {
    const { value, done } = await iter.next();
    if (value)
      await cb(value);
    if (done)
      break;
  if (iter.return)
    iter.return();
async function collect2(iterable) {
  let size = 0;
  const buffers = [];
  await forAwait2(iterable, (value) => {
    buffers.push(value);
    size += value.byteLength;
  });
  const result = new Uint8Array(size);
  let nextIndex = 0;
  for (const buffer2 of buffers) {
    result.set(buffer2, nextIndex);
    nextIndex += buffer2.byteLength;
  return result;

// src/simpleGit.ts
init_polyfill_buffer();
var import_child_process2 = __toModule(require("child_process"));
var import_obsidian6 = __toModule(require("obsidian"));
var path = __toModule(require("path"));
var import_path = __toModule(require("path"));

// node_modules/simple-git/dist/esm/index.js
init_polyfill_buffer();
var import_file_exists = __toModule(require_dist());
var import_debug = __toModule(require_browser());
var import_child_process = __toModule(require("child_process"));
var import_promise_deferred = __toModule(require_dist2());
var import_promise_deferred2 = __toModule(require_dist2());
var __defProp2 = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp2 = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key2, value) => key2 in obj ? __defProp2(obj, key2, { enumerable: true, configurable: true, writable: true, value }) : obj[key2] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp2.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule2 = (target) => __defProp2(target, "__esModule", { value: true });
var __esm2 = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
};
var __commonJS2 = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export2 = (target, all) => {
  for (var name in all)
    __defProp2(target, name, { get: all[name], enumerable: true });
};
var __reExport2 = (target, module2, copyDefault, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key2 of __getOwnPropNames2(module2))
      if (!__hasOwnProp2.call(target, key2) && (copyDefault || key2 !== "default"))
        __defProp2(target, key2, { get: () => module2[key2], enumerable: !(desc = __getOwnPropDesc2(module2, key2)) || desc.enumerable });
  }
  return target;
};
var __toCommonJS = /* @__PURE__ */ ((cache) => {
  return (module2, temp) => {
    return cache && cache.get(module2) || (temp = __reExport2(__markAsModule2({}), module2, 1), cache && cache.set(module2, temp), temp);
})(typeof WeakMap !== "undefined" ? /* @__PURE__ */ new WeakMap() : 0);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
var GitError;
var init_git_error = __esm2({
  "src/lib/errors/git-error.ts"() {
    GitError = class extends Error {
      constructor(task, message) {
        super(message);
        this.task = task;
        Object.setPrototypeOf(this, new.target.prototype);
      }
    };
var GitResponseError;
var init_git_response_error = __esm2({
  "src/lib/errors/git-response-error.ts"() {
    init_git_error();
    GitResponseError = class extends GitError {
      constructor(git, message) {
        super(void 0, message || String(git));
        this.git = git;
      }
    };
});
var TaskConfigurationError;
var init_task_configuration_error = __esm2({
  "src/lib/errors/task-configuration-error.ts"() {
    init_git_error();
    TaskConfigurationError = class extends GitError {
      constructor(message) {
        super(void 0, message);
      }
    };
});
function asFunction(source) {
  return typeof source === "function" ? source : NOOP;
}
function isUserFunction(source) {
  return typeof source === "function" && source !== NOOP;
}
function splitOn(input, char) {
  const index2 = input.indexOf(char);
  if (index2 <= 0) {
    return [input, ""];
  return [input.substr(0, index2), input.substr(index2 + 1)];
function first(input, offset = 0) {
  return isArrayLike(input) && input.length > offset ? input[offset] : void 0;
function last(input, offset = 0) {
  if (isArrayLike(input) && input.length > offset) {
    return input[input.length - 1 - offset];
  }
function isArrayLike(input) {
  return !!(input && typeof input.length === "number");
}
function toLinesWithContent(input = "", trimmed2 = true, separator2 = "\n") {
  return input.split(separator2).reduce((output, line) => {
    const lineContent = trimmed2 ? line.trim() : line;
    if (lineContent) {
      output.push(lineContent);
    return output;
  }, []);
function forEachLineWithContent(input, callback) {
  return toLinesWithContent(input, true).map((line) => callback(line));
function folderExists(path2) {
  return (0, import_file_exists.exists)(path2, import_file_exists.FOLDER);
function append(target, item) {
  if (Array.isArray(target)) {
    if (!target.includes(item)) {
      target.push(item);
    }
  } else {
    target.add(item);
  return item;
function including(target, item) {
  if (Array.isArray(target) && !target.includes(item)) {
    target.push(item);
  return target;
function remove2(target, item) {
  if (Array.isArray(target)) {
    const index2 = target.indexOf(item);
    if (index2 >= 0) {
      target.splice(index2, 1);
  } else {
    target.delete(item);
  return item;
function asArray(source) {
  return Array.isArray(source) ? source : [source];
function asStringArray(source) {
  return asArray(source).map(String);
function asNumber(source, onNaN = 0) {
  if (source == null) {
    return onNaN;
  const num2 = parseInt(source, 10);
  return isNaN(num2) ? onNaN : num2;
function prefixedArray(input, prefix) {
  const output = [];
  for (let i = 0, max = input.length; i < max; i++) {
    output.push(prefix, input[i]);
  return output;
function bufferToString(input) {
  return (Array.isArray(input) ? Buffer2.concat(input) : input).toString("utf-8");
function pick(source, properties) {
  return Object.assign({}, ...properties.map((property) => property in source ? { [property]: source[property] } : {}));
function delay(duration = 0) {
  return new Promise((done) => setTimeout(done, duration));
var NULL;
var NOOP;
var objectToString;
var init_util = __esm2({
  "src/lib/utils/util.ts"() {
    NULL = "\0";
    NOOP = () => {
    };
    objectToString = Object.prototype.toString.call.bind(Object.prototype.toString);
function filterType(input, filter, def) {
  if (filter(input)) {
    return input;
  }
  return arguments.length > 2 ? def : void 0;
function filterPrimitives(input, omit) {
  return /number|string|boolean/.test(typeof input) && (!omit || !omit.includes(typeof input));
function filterPlainObject(input) {
  return !!input && objectToString(input) === "[object Object]";
function filterFunction(input) {
  return typeof input === "function";
}
var filterArray;
var filterString;
var filterStringArray;
var filterStringOrStringArray;
var filterHasLength;
var init_argument_filters = __esm2({
  "src/lib/utils/argument-filters.ts"() {
    init_util();
    filterArray = (input) => {
      return Array.isArray(input);
    };
    filterString = (input) => {
      return typeof input === "string";
    };
    filterStringArray = (input) => {
      return Array.isArray(input) && input.every(filterString);
    };
    filterStringOrStringArray = (input) => {
      return filterString(input) || Array.isArray(input) && input.every(filterString);
    };
    filterHasLength = (input) => {
      if (input == null || "number|boolean|function".includes(typeof input)) {
        return false;
      return Array.isArray(input) || typeof input === "string" || typeof input.length === "number";
var ExitCodes;
var init_exit_codes = __esm2({
  "src/lib/utils/exit-codes.ts"() {
    ExitCodes = /* @__PURE__ */ ((ExitCodes2) => {
      ExitCodes2[ExitCodes2["SUCCESS"] = 0] = "SUCCESS";
      ExitCodes2[ExitCodes2["ERROR"] = 1] = "ERROR";
      ExitCodes2[ExitCodes2["NOT_FOUND"] = -2] = "NOT_FOUND";
      ExitCodes2[ExitCodes2["UNCLEAN"] = 128] = "UNCLEAN";
      return ExitCodes2;
    })(ExitCodes || {});
var GitOutputStreams;
var init_git_output_streams = __esm2({
  "src/lib/utils/git-output-streams.ts"() {
    GitOutputStreams = class {
      constructor(stdOut, stdErr) {
        this.stdOut = stdOut;
        this.stdErr = stdErr;
      }
      asStrings() {
        return new GitOutputStreams(this.stdOut.toString("utf8"), this.stdErr.toString("utf8"));
var LineParser;
var RemoteLineParser;
var init_line_parser = __esm2({
  "src/lib/utils/line-parser.ts"() {
    LineParser = class {
      constructor(regExp, useMatches) {
        this.matches = [];
        this.parse = (line, target) => {
          this.resetMatches();
          if (!this._regExp.every((reg, index2) => this.addMatch(reg, index2, line(index2)))) {
            return false;
          }
          return this.useMatches(target, this.prepareMatches()) !== false;
        };
        this._regExp = Array.isArray(regExp) ? regExp : [regExp];
        if (useMatches) {
          this.useMatches = useMatches;
        }
      useMatches(target, match) {
        throw new Error(`LineParser:useMatches not implemented`);
      resetMatches() {
        this.matches.length = 0;
      prepareMatches() {
        return this.matches;
      addMatch(reg, index2, line) {
        const matched = line && reg.exec(line);
        if (matched) {
          this.pushMatch(index2, matched);
        return !!matched;
      pushMatch(_index, matched) {
        this.matches.push(...matched.slice(1));
    };
    RemoteLineParser = class extends LineParser {
      addMatch(reg, index2, line) {
        return /^remote:\s/.test(String(line)) && super.addMatch(reg, index2, line);
      pushMatch(index2, matched) {
        if (index2 > 0 || matched.length > 1) {
          super.pushMatch(index2, matched);
        }
function createInstanceConfig(...options) {
  const baseDir = process.cwd();
  const config = Object.assign(__spreadValues({ baseDir }, defaultOptions), ...options.filter((o) => typeof o === "object" && o));
  config.baseDir = config.baseDir || baseDir;
  config.trimmed = config.trimmed === true;
  return config;
var defaultOptions;
var init_simple_git_options = __esm2({
  "src/lib/utils/simple-git-options.ts"() {
    defaultOptions = {
      binary: "git",
      maxConcurrentProcesses: 5,
      config: [],
      trimmed: false
function appendTaskOptions(options, commands = []) {
  if (!filterPlainObject(options)) {
    return commands;
  return Object.keys(options).reduce((commands2, key2) => {
    const value = options[key2];
    if (filterPrimitives(value, ["boolean"])) {
      commands2.push(key2 + "=" + value);
    } else {
      commands2.push(key2);
    return commands2;
  }, commands);
function getTrailingOptions(args, initialPrimitive = 0, objectOnly = false) {
  const command = [];
  for (let i = 0, max = initialPrimitive < 0 ? args.length : initialPrimitive; i < max; i++) {
    if ("string|number".includes(typeof args[i])) {
      command.push(String(args[i]));
  appendTaskOptions(trailingOptionsArgument(args), command);
  if (!objectOnly) {
    command.push(...trailingArrayArgument(args));
  }
  return command;
function trailingArrayArgument(args) {
  const hasTrailingCallback = typeof last(args) === "function";
  return filterType(last(args, hasTrailingCallback ? 1 : 0), filterArray, []);
}
function trailingOptionsArgument(args) {
  const hasTrailingCallback = filterFunction(last(args));
  return filterType(last(args, hasTrailingCallback ? 1 : 0), filterPlainObject);
}
function trailingFunctionArgument(args, includeNoop = true) {
  const callback = asFunction(last(args));
  return includeNoop || isUserFunction(callback) ? callback : void 0;
}
var init_task_options = __esm2({
  "src/lib/utils/task-options.ts"() {
    init_argument_filters();
    init_util();
function callTaskParser(parser3, streams) {
  return parser3(streams.stdOut, streams.stdErr);
}
function parseStringResponse(result, parsers12, texts, trim = true) {
  asArray(texts).forEach((text2) => {
    for (let lines = toLinesWithContent(text2, trim), i = 0, max = lines.length; i < max; i++) {
      const line = (offset = 0) => {
        if (i + offset >= max) {
          return;
        }
        return lines[i + offset];
      };
      parsers12.some(({ parse: parse2 }) => parse2(line, result));
  return result;
var init_task_parser = __esm2({
  "src/lib/utils/task-parser.ts"() {
    init_util();
var utils_exports = {};
__export2(utils_exports, {
  ExitCodes: () => ExitCodes,
  GitOutputStreams: () => GitOutputStreams,
  LineParser: () => LineParser,
  NOOP: () => NOOP,
  NULL: () => NULL,
  RemoteLineParser: () => RemoteLineParser,
  append: () => append,
  appendTaskOptions: () => appendTaskOptions,
  asArray: () => asArray,
  asFunction: () => asFunction,
  asNumber: () => asNumber,
  asStringArray: () => asStringArray,
  bufferToString: () => bufferToString,
  callTaskParser: () => callTaskParser,
  createInstanceConfig: () => createInstanceConfig,
  delay: () => delay,
  filterArray: () => filterArray,
  filterFunction: () => filterFunction,
  filterHasLength: () => filterHasLength,
  filterPlainObject: () => filterPlainObject,
  filterPrimitives: () => filterPrimitives,
  filterString: () => filterString,
  filterStringArray: () => filterStringArray,
  filterStringOrStringArray: () => filterStringOrStringArray,
  filterType: () => filterType,
  first: () => first,
  folderExists: () => folderExists,
  forEachLineWithContent: () => forEachLineWithContent,
  getTrailingOptions: () => getTrailingOptions,
  including: () => including,
  isUserFunction: () => isUserFunction,
  last: () => last,
  objectToString: () => objectToString,
  parseStringResponse: () => parseStringResponse,
  pick: () => pick,
  prefixedArray: () => prefixedArray,
  remove: () => remove2,
  splitOn: () => splitOn,
  toLinesWithContent: () => toLinesWithContent,
  trailingFunctionArgument: () => trailingFunctionArgument,
  trailingOptionsArgument: () => trailingOptionsArgument
});
var init_utils = __esm2({
  "src/lib/utils/index.ts"() {
    init_argument_filters();
    init_exit_codes();
    init_git_output_streams();
    init_line_parser();
    init_simple_git_options();
    init_task_options();
    init_task_parser();
    init_util();
var check_is_repo_exports = {};
__export2(check_is_repo_exports, {
  CheckRepoActions: () => CheckRepoActions,
  checkIsBareRepoTask: () => checkIsBareRepoTask,
  checkIsRepoRootTask: () => checkIsRepoRootTask,
  checkIsRepoTask: () => checkIsRepoTask
function checkIsRepoTask(action) {
  switch (action) {
    case "bare":
      return checkIsBareRepoTask();
    case "root":
      return checkIsRepoRootTask();
  }
  const commands = ["rev-parse", "--is-inside-work-tree"];
    onError,
    parser
function checkIsRepoRootTask() {
  const commands = ["rev-parse", "--git-dir"];
    commands,
    format: "utf-8",
    onError,
    parser(path2) {
      return /^\.(git)?$/.test(path2.trim());
function checkIsBareRepoTask() {
  const commands = ["rev-parse", "--is-bare-repository"];
  return {
    commands,
    format: "utf-8",
    onError,
    parser
  };
}
function isNotRepoMessage(error) {
  return /(Not a git repository|Kein Git-Repository)/i.test(String(error));
}
var CheckRepoActions;
var onError;
var parser;
var init_check_is_repo = __esm2({
  "src/lib/tasks/check-is-repo.ts"() {
    CheckRepoActions = /* @__PURE__ */ ((CheckRepoActions2) => {
      CheckRepoActions2["BARE"] = "bare";
      CheckRepoActions2["IN_TREE"] = "tree";
      CheckRepoActions2["IS_REPO_ROOT"] = "root";
      return CheckRepoActions2;
    })(CheckRepoActions || {});
    onError = ({ exitCode }, error, done, fail) => {
      if (exitCode === 128 && isNotRepoMessage(error)) {
        return done(Buffer2.from("false"));
      }
      fail(error);
    };
    parser = (text2) => {
      return text2.trim() === "true";
    };
function cleanSummaryParser(dryRun, text2) {
  const summary = new CleanResponse(dryRun);
  const regexp = dryRun ? dryRunRemovalRegexp : removalRegexp;
  toLinesWithContent(text2).forEach((line) => {
    const removed = line.replace(regexp, "");
    summary.paths.push(removed);
    (isFolderRegexp.test(removed) ? summary.folders : summary.files).push(removed);
  });
  return summary;
var CleanResponse;
var removalRegexp;
var dryRunRemovalRegexp;
var isFolderRegexp;
var init_CleanSummary = __esm2({
  "src/lib/responses/CleanSummary.ts"() {
    init_utils();
    CleanResponse = class {
      constructor(dryRun) {
        this.dryRun = dryRun;
        this.paths = [];
        this.files = [];
        this.folders = [];
    removalRegexp = /^[a-z]+\s*/i;
    dryRunRemovalRegexp = /^[a-z]+\s+[a-z]+\s*/i;
    isFolderRegexp = /\/$/;
var task_exports = {};
__export2(task_exports, {
  EMPTY_COMMANDS: () => EMPTY_COMMANDS,
  adhocExecTask: () => adhocExecTask,
  configurationErrorTask: () => configurationErrorTask,
  isBufferTask: () => isBufferTask,
  isEmptyTask: () => isEmptyTask,
  straightThroughBufferTask: () => straightThroughBufferTask,
  straightThroughStringTask: () => straightThroughStringTask
});
function adhocExecTask(parser3) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser: parser3
  };
function configurationErrorTask(error) {
  return {
    commands: EMPTY_COMMANDS,
    format: "empty",
    parser() {
      throw typeof error === "string" ? new TaskConfigurationError(error) : error;
    }
  };
}
function straightThroughStringTask(commands, trimmed2 = false) {
      return trimmed2 ? String(text2).trim() : text2;
function straightThroughBufferTask(commands) {
  return {
    commands,
    format: "buffer",
    parser(buffer2) {
      return buffer2;
    }
  };
}
function isBufferTask(task) {
  return task.format === "buffer";
}
function isEmptyTask(task) {
  return task.format === "empty" || !task.commands.length;
}
var EMPTY_COMMANDS;
var init_task = __esm2({
  "src/lib/tasks/task.ts"() {
    init_task_configuration_error();
    EMPTY_COMMANDS = [];
var clean_exports = {};
__export2(clean_exports, {
  CONFIG_ERROR_INTERACTIVE_MODE: () => CONFIG_ERROR_INTERACTIVE_MODE,
  CONFIG_ERROR_MODE_REQUIRED: () => CONFIG_ERROR_MODE_REQUIRED,
  CONFIG_ERROR_UNKNOWN_OPTION: () => CONFIG_ERROR_UNKNOWN_OPTION,
  CleanOptions: () => CleanOptions,
  cleanTask: () => cleanTask,
  cleanWithOptionsTask: () => cleanWithOptionsTask,
  isCleanOptionsArray: () => isCleanOptionsArray
});
function cleanWithOptionsTask(mode, customArgs) {
  const { cleanMode, options, valid } = getCleanOptions(mode);
  if (!cleanMode) {
    return configurationErrorTask(CONFIG_ERROR_MODE_REQUIRED);
  if (!valid.options) {
    return configurationErrorTask(CONFIG_ERROR_UNKNOWN_OPTION + JSON.stringify(mode));
  }
  options.push(...customArgs);
  if (options.some(isInteractiveMode)) {
    return configurationErrorTask(CONFIG_ERROR_INTERACTIVE_MODE);
  }
  return cleanTask(cleanMode, options);
function cleanTask(mode, customArgs) {
  const commands = ["clean", `-${mode}`, ...customArgs];
  return {
    commands,
    format: "utf-8",
    parser(text2) {
      return cleanSummaryParser(mode === "n", text2);
    }
  };
function isCleanOptionsArray(input) {
  return Array.isArray(input) && input.every((test) => CleanOptionValues.has(test));
}
function getCleanOptions(input) {
  let cleanMode;
  let options = [];
  let valid = { cleanMode: false, options: true };
  input.replace(/[^a-z]i/g, "").split("").forEach((char) => {
    if (isCleanMode(char)) {
      cleanMode = char;
      valid.cleanMode = true;
    } else {
      valid.options = valid.options && isKnownOption(options[options.length] = `-${char}`);
    }
  });
  return {
    cleanMode,
    options,
    valid
  };
}
function isCleanMode(cleanMode) {
  return cleanMode === "f" || cleanMode === "n";
}
function isKnownOption(option) {
  return /^-[a-z]$/i.test(option) && CleanOptionValues.has(option.charAt(1));
}
function isInteractiveMode(option) {
  if (/^-[^\-]/.test(option)) {
    return option.indexOf("i") > 0;
  return option === "--interactive";
}
var CONFIG_ERROR_INTERACTIVE_MODE;
var CONFIG_ERROR_MODE_REQUIRED;
var CONFIG_ERROR_UNKNOWN_OPTION;
var CleanOptions;
var CleanOptionValues;
var init_clean = __esm2({
  "src/lib/tasks/clean.ts"() {
    init_CleanSummary();
    init_utils();
    init_task();
    CONFIG_ERROR_INTERACTIVE_MODE = "Git clean interactive mode is not supported";
    CONFIG_ERROR_MODE_REQUIRED = 'Git clean mode parameter ("n" or "f") is required';
    CONFIG_ERROR_UNKNOWN_OPTION = "Git clean unknown option found in: ";
    CleanOptions = /* @__PURE__ */ ((CleanOptions2) => {
      CleanOptions2["DRY_RUN"] = "n";
      CleanOptions2["FORCE"] = "f";
      CleanOptions2["IGNORED_INCLUDED"] = "x";
      CleanOptions2["IGNORED_ONLY"] = "X";
      CleanOptions2["EXCLUDING"] = "e";
      CleanOptions2["QUIET"] = "q";
      CleanOptions2["RECURSIVE"] = "d";
      return CleanOptions2;
    })(CleanOptions || {});
    CleanOptionValues = /* @__PURE__ */ new Set([
      "i",
      ...asStringArray(Object.values(CleanOptions))
    ]);
function configListParser(text2) {
  const config = new ConfigList();
  for (const item of configParser(text2)) {
    config.addValue(item.file, String(item.key), item.value);
  }
  return config;
function configGetParser(text2, key2) {
  let value = null;
  const values = [];
  const scopes = /* @__PURE__ */ new Map();
  for (const item of configParser(text2, key2)) {
    if (item.key !== key2) {
      continue;
    }
    values.push(value = item.value);
    if (!scopes.has(item.file)) {
      scopes.set(item.file, []);
    }
    scopes.get(item.file).push(value);
  return {
    key: key2,
    paths: Array.from(scopes.keys()),
    scopes,
    value,
    values
function configFilePath(filePath) {
  return filePath.replace(/^(file):/, "");
}
function* configParser(text2, requestedKey = null) {
  const lines = text2.split("\0");
  for (let i = 0, max = lines.length - 1; i < max; ) {
    const file = configFilePath(lines[i++]);
    let value = lines[i++];
    let key2 = requestedKey;
    if (value.includes("\n")) {
      const line = splitOn(value, "\n");
      key2 = line[0];
      value = line[1];
    }
    yield { file, key: key2, value };
  }
}
var ConfigList;
var init_ConfigList = __esm2({
  "src/lib/responses/ConfigList.ts"() {
    ConfigList = class {
      constructor() {
        this.files = [];
        this.values = /* @__PURE__ */ Object.create(null);
      }
      get all() {
        if (!this._all) {
          this._all = this.files.reduce((all, file) => {
            return Object.assign(all, this.values[file]);
          }, {});
        }
        return this._all;
      }
      addFile(file) {
        if (!(file in this.values)) {
          const latest = last(this.files);
          this.values[file] = latest ? Object.create(this.values[latest]) : {};
          this.files.push(file);
        }
        return this.values[file];
      }
      addValue(file, key2, value) {
        const values = this.addFile(file);
        if (!values.hasOwnProperty(key2)) {
          values[key2] = value;
        } else if (Array.isArray(values[key2])) {
          values[key2].push(value);
        } else {
          values[key2] = [values[key2], value];
        }
        this._all = void 0;
      }
    };
function asConfigScope(scope, fallback) {
  if (typeof scope === "string" && GitConfigScope.hasOwnProperty(scope)) {
    return scope;
  return fallback;
}
function addConfigTask(key2, value, append22, scope) {
  const commands = ["config", `--${scope}`];
  if (append22) {
    commands.push("--add");
  }
  commands.push(key2, value);
  return {
    parser(text2) {
      return text2;
    }
function getConfigTask(key2, scope) {
  const commands = ["config", "--null", "--show-origin", "--get-all", key2];
  if (scope) {
    commands.splice(1, 0, `--${scope}`);
  return {
    commands,
    format: "utf-8",
    parser(text2) {
      return configGetParser(text2, key2);
    }
  };
function listConfigTask(scope) {
  const commands = ["config", "--list", "--show-origin", "--null"];
  if (scope) {
    commands.push(`--${scope}`);
  return {
    commands,
    format: "utf-8",
    parser(text2) {
      return configListParser(text2);
  };
function config_default() {
    addConfig(key2, value, ...rest) {
      return this._runTask(addConfigTask(key2, value, rest[0] === true, asConfigScope(rest[1], "local")), trailingFunctionArgument(arguments));
    },
    getConfig(key2, scope) {
      return this._runTask(getConfigTask(key2, asConfigScope(scope, void 0)), trailingFunctionArgument(arguments));
    },
    listConfig(...rest) {
      return this._runTask(listConfigTask(asConfigScope(rest[0], void 0)), trailingFunctionArgument(arguments));
    }
var GitConfigScope;
var init_config = __esm2({
  "src/lib/tasks/config.ts"() {
    init_ConfigList();
    init_utils();
    GitConfigScope = /* @__PURE__ */ ((GitConfigScope2) => {
      GitConfigScope2["system"] = "system";
      GitConfigScope2["global"] = "global";
      GitConfigScope2["local"] = "local";
      GitConfigScope2["worktree"] = "worktree";
      return GitConfigScope2;
    })(GitConfigScope || {});
  }
});
function grepQueryBuilder(...params) {
  return new GrepQuery().param(...params);
}
function parseGrep(grep) {
  const paths = /* @__PURE__ */ new Set();
  const results = {};
  forEachLineWithContent(grep, (input) => {
    const [path2, line, preview] = input.split(NULL);
    paths.add(path2);
    (results[path2] = results[path2] || []).push({
      line: asNumber(line),
      path: path2,
      preview
    });
  });
    paths,
    results
function grep_default() {
    grep(searchTerm) {
      const then = trailingFunctionArgument(arguments);
      const options = getTrailingOptions(arguments);
      for (const option of disallowedOptions) {
        if (options.includes(option)) {
          return this._runTask(configurationErrorTask(`git.grep: use of "${option}" is not supported.`), then);
        }
      }
      if (typeof searchTerm === "string") {
        searchTerm = grepQueryBuilder().param(searchTerm);
      }
      const commands = ["grep", "--null", "-n", "--full-name", ...options, ...searchTerm];
      return this._runTask({
        commands,
        format: "utf-8",
        parser(stdOut) {
          return parseGrep(stdOut);
        }
      }, then);
var disallowedOptions;
var Query;
var _a;
var GrepQuery;
var init_grep = __esm2({
  "src/lib/tasks/grep.ts"() {
    disallowedOptions = ["-h"];
    Query = Symbol("grepQuery");
    GrepQuery = class {
        this[_a] = [];
      *[(_a = Query, Symbol.iterator)]() {
        for (const query of this[Query]) {
          yield query;
      and(...and) {
        and.length && this[Query].push("--and", "(", ...prefixedArray(and, "-e"), ")");
        return this;
      param(...param) {
        this[Query].push(...prefixedArray(param, "-e"));
        return this;
var reset_exports = {};
__export2(reset_exports, {
  ResetMode: () => ResetMode,
  getResetMode: () => getResetMode,
  resetTask: () => resetTask
});
function resetTask(mode, customArgs) {
  const commands = ["reset"];
  if (isValidResetMode(mode)) {
    commands.push(`--${mode}`);
  }
  commands.push(...customArgs);
  return straightThroughStringTask(commands);
function getResetMode(mode) {
  if (isValidResetMode(mode)) {
    return mode;
  }
  switch (typeof mode) {
    case "string":
    case "undefined":
      return "soft";
  }
  return;
function isValidResetMode(mode) {
  return ResetModes.includes(mode);
}
var ResetMode;
var ResetModes;
var init_reset = __esm2({
  "src/lib/tasks/reset.ts"() {
    init_task();
    ResetMode = /* @__PURE__ */ ((ResetMode2) => {
      ResetMode2["MIXED"] = "mixed";
      ResetMode2["SOFT"] = "soft";
      ResetMode2["HARD"] = "hard";
      ResetMode2["MERGE"] = "merge";
      ResetMode2["KEEP"] = "keep";
      return ResetMode2;
    })(ResetMode || {});
    ResetModes = Array.from(Object.values(ResetMode));
function createLog() {
  return (0, import_debug.default)("simple-git");
function prefixedLogger(to, prefix, forward) {
  if (!prefix || !String(prefix).replace(/\s*/, "")) {
    return !forward ? to : (message, ...args) => {
      to(message, ...args);
      forward(message, ...args);
    };
  }
  return (message, ...args) => {
    to(`%s ${message}`, prefix, ...args);
    if (forward) {
      forward(message, ...args);
    }
  };
}
function childLoggerName(name, childDebugger, { namespace: parentNamespace }) {
  if (typeof name === "string") {
    return name;
  }
  const childNamespace = childDebugger && childDebugger.namespace || "";
  if (childNamespace.startsWith(parentNamespace)) {
    return childNamespace.substr(parentNamespace.length + 1);
  }
  return childNamespace || parentNamespace;
}
function createLogger(label, verbose, initialStep, infoDebugger = createLog()) {
  const labelPrefix = label && `[${label}]` || "";
  const spawned = [];
  const debugDebugger = typeof verbose === "string" ? infoDebugger.extend(verbose) : verbose;
  const key2 = childLoggerName(filterType(verbose, filterString), debugDebugger, infoDebugger);
  return step(initialStep);
  function sibling(name, initial) {
    return append(spawned, createLogger(label, key2.replace(/^[^:]+/, name), initial, infoDebugger));
  }
  function step(phase) {
    const stepPrefix = phase && `[${phase}]` || "";
    const debug2 = debugDebugger && prefixedLogger(debugDebugger, stepPrefix) || NOOP;
    const info = prefixedLogger(infoDebugger, `${labelPrefix} ${stepPrefix}`, debug2);
    return Object.assign(debugDebugger ? debug2 : info, {
      label,
      sibling,
      info,
      step
    });
  }
}
var init_git_logger = __esm2({
  "src/lib/git-logger.ts"() {
    import_debug.default.formatters.L = (value) => String(filterHasLength(value) ? value.length : "-");
    import_debug.default.formatters.B = (value) => {
      if (Buffer2.isBuffer(value)) {
        return value.toString("utf8");
      return objectToString(value);
var _TasksPendingQueue;
var TasksPendingQueue;
var init_tasks_pending_queue = __esm2({
  "src/lib/runners/tasks-pending-queue.ts"() {
    init_git_error();
    init_git_logger();
    _TasksPendingQueue = class {
      constructor(logLabel = "GitExecutor") {
        this.logLabel = logLabel;
        this._queue = /* @__PURE__ */ new Map();
      }
      withProgress(task) {
        return this._queue.get(task);
      }
      createProgress(task) {
        const name = _TasksPendingQueue.getName(task.commands[0]);
        const logger = createLogger(this.logLabel, name);
        return {
          task,
          logger,
          name
        };
      }
      push(task) {
        const progress = this.createProgress(task);
        progress.logger("Adding task to the queue, commands = %o", task.commands);
        this._queue.set(task, progress);
        return progress;
      }
      fatal(err) {
        for (const [task, { logger }] of Array.from(this._queue.entries())) {
          if (task === err.task) {
            logger.info(`Failed %o`, err);
            logger(`Fatal exception, any as-yet un-started tasks run through this executor will not be attempted`);
          } else {
            logger.info(`A fatal exception occurred in a previous task, the queue has been purged: %o`, err.message);
          }
          this.complete(task);
        if (this._queue.size !== 0) {
          throw new Error(`Queue size should be zero after fatal: ${this._queue.size}`);
      }
      complete(task) {
        const progress = this.withProgress(task);
        if (progress) {
          this._queue.delete(task);
      }
      attempt(task) {
        const progress = this.withProgress(task);
        if (!progress) {
          throw new GitError(void 0, "TasksPendingQueue: attempt called for an unknown task");
        }
        progress.logger("Starting task");
        return progress;
      }
      static getName(name = "empty") {
        return `task:${name}:${++_TasksPendingQueue.counter}`;
      }
    TasksPendingQueue = _TasksPendingQueue;
    TasksPendingQueue.counter = 0;
function pluginContext(task, commands) {
    method: first(task.commands) || "",
    commands
function onErrorReceived(target, logger) {
  return (err) => {
    logger(`[ERROR] child process exception %o`, err);
    target.push(Buffer2.from(String(err.stack), "ascii"));
function onDataReceived(target, name, logger, output) {
  return (buffer2) => {
    logger(`%s received %L bytes`, name, buffer2);
    output(`%B`, buffer2);
    target.push(buffer2);
  };
}
var GitExecutorChain;
var init_git_executor_chain = __esm2({
  "src/lib/runners/git-executor-chain.ts"() {
    init_git_error();
    init_task();
    init_tasks_pending_queue();
    GitExecutorChain = class {
      constructor(_executor, _scheduler, _plugins) {
        this._executor = _executor;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = Promise.resolve();
        this._queue = new TasksPendingQueue();
      }
      get binary() {
        return this._executor.binary;
      }
      get cwd() {
        return this._cwd || this._executor.cwd;
      }
      set cwd(cwd) {
        this._cwd = cwd;
      }
      get env() {
        return this._executor.env;
      }
      get outputHandler() {
        return this._executor.outputHandler;
      }
      chain() {
        return this;
      }
      push(task) {
        this._queue.push(task);
        return this._chain = this._chain.then(() => this.attemptTask(task));
      }
      attemptTask(task) {
        return __async(this, null, function* () {
          const onScheduleComplete = yield this._scheduler.next();
          const onQueueComplete = () => this._queue.complete(task);
          try {
            const { logger } = this._queue.attempt(task);
            return yield isEmptyTask(task) ? this.attemptEmptyTask(task, logger) : this.attemptRemoteTask(task, logger);
          } catch (e) {
            throw this.onFatalException(task, e);
          } finally {
            onQueueComplete();
            onScheduleComplete();
          }
      }
      onFatalException(task, e) {
        const gitError = e instanceof GitError ? Object.assign(e, { task }) : new GitError(task, e && String(e));
        this._chain = Promise.resolve();
        this._queue.fatal(gitError);
        return gitError;
      }
      attemptRemoteTask(task, logger) {
        return __async(this, null, function* () {
          const args = this._plugins.exec("spawn.args", [...task.commands], pluginContext(task, task.commands));
          const raw = yield this.gitResponse(task, this.binary, args, this.outputHandler, logger.step("SPAWN"));
          const outputStreams = yield this.handleTaskData(task, args, raw, logger.step("HANDLE"));
          logger(`passing response to task's parser as a %s`, task.format);
          if (isBufferTask(task)) {
            return callTaskParser(task.parser, outputStreams);
          }
          return callTaskParser(task.parser, outputStreams.asStrings());
      }
      attemptEmptyTask(task, logger) {
        return __async(this, null, function* () {
          logger(`empty task bypassing child process to call to task's parser`);
          return task.parser(this);
        });
      }
      handleTaskData(task, args, result, logger) {
        const { exitCode, rejection, stdOut, stdErr } = result;
        return new Promise((done, fail) => {
          logger(`Preparing to handle process response exitCode=%d stdOut=`, exitCode);
          const { error } = this._plugins.exec("task.error", { error: rejection }, __spreadValues(__spreadValues({}, pluginContext(task, args)), result));
          if (error && task.onError) {
            logger.info(`exitCode=%s handling with custom error handler`);
            return task.onError(result, error, (newStdOut) => {
              logger.info(`custom error handler treated as success`);
              logger(`custom error returned a %s`, objectToString(newStdOut));
              done(new GitOutputStreams(Array.isArray(newStdOut) ? Buffer2.concat(newStdOut) : newStdOut, Buffer2.concat(stdErr)));
            }, fail);
          if (error) {
            logger.info(`handling as error: exitCode=%s stdErr=%s rejection=%o`, exitCode, stdErr.length, rejection);
            return fail(error);
          }
          logger.info(`retrieving task output complete`);
          done(new GitOutputStreams(Buffer2.concat(stdOut), Buffer2.concat(stdErr)));
        });
      }
      gitResponse(task, command, args, outputHandler, logger) {
        return __async(this, null, function* () {
          const outputLogger = logger.sibling("output");
          const spawnOptions = this._plugins.exec("spawn.options", {
            cwd: this.cwd,
            env: this.env,
            windowsHide: true
          }, pluginContext(task, task.commands));
          return new Promise((done) => {
            const stdOut = [];
            const stdErr = [];
            logger.info(`%s %o`, command, args);
            logger("%O", spawnOptions);
            let rejection = this._beforeSpawn(task, args);
            if (rejection) {
              return done({
                stdOut,
                stdErr,
                exitCode: 9901,
                rejection
              });
            }
            this._plugins.exec("spawn.before", void 0, __spreadProps(__spreadValues({}, pluginContext(task, args)), {
              kill(reason) {
                rejection = reason || rejection;
              }
            }));
            const spawned = (0, import_child_process.spawn)(command, args, spawnOptions);
            spawned.stdout.on("data", onDataReceived(stdOut, "stdOut", logger, outputLogger.step("stdOut")));
            spawned.stderr.on("data", onDataReceived(stdErr, "stdErr", logger, outputLogger.step("stdErr")));
            spawned.on("error", onErrorReceived(stdErr, logger));
            if (outputHandler) {
              logger(`Passing child process stdOut/stdErr to custom outputHandler`);
              outputHandler(command, spawned.stdout, spawned.stderr, [...args]);
            }
            this._plugins.exec("spawn.after", void 0, __spreadProps(__spreadValues({}, pluginContext(task, args)), {
              spawned,
              close(exitCode, reason) {
                done({
                  stdOut,
                  stdErr,
                  exitCode,
                  rejection: rejection || reason
                });
              },
              kill(reason) {
                if (spawned.killed) {
                  return;
                }
                rejection = reason;
                spawned.kill("SIGINT");
              }
            }));
          });
        });
      }
      _beforeSpawn(task, args) {
        let rejection;
        this._plugins.exec("spawn.before", void 0, __spreadProps(__spreadValues({}, pluginContext(task, args)), {
          kill(reason) {
            rejection = reason || rejection;
          }
        }));
        return rejection;
      }
var git_executor_exports = {};
__export2(git_executor_exports, {
  GitExecutor: () => GitExecutor
var GitExecutor;
var init_git_executor = __esm2({
  "src/lib/runners/git-executor.ts"() {
    init_git_executor_chain();
    GitExecutor = class {
      constructor(binary = "git", cwd, _scheduler, _plugins) {
        this.binary = binary;
        this.cwd = cwd;
        this._scheduler = _scheduler;
        this._plugins = _plugins;
        this._chain = new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      chain() {
        return new GitExecutorChain(this, this._scheduler, this._plugins);
      }
      push(task) {
        return this._chain.push(task);
function taskCallback(task, response, callback = NOOP) {
  const onSuccess = (data) => {
    callback(null, data);
  const onError2 = (err) => {
    if ((err == null ? void 0 : err.task) === task) {
      callback(err instanceof GitResponseError ? addDeprecationNoticeToError(err) : err, void 0);
    }
  };
  response.then(onSuccess, onError2);
function addDeprecationNoticeToError(err) {
  let log2 = (name) => {
    console.warn(`simple-git deprecation notice: accessing GitResponseError.${name} should be GitResponseError.git.${name}, this will no longer be available in version 3`);
    log2 = NOOP;
  };
  return Object.create(err, Object.getOwnPropertyNames(err.git).reduce(descriptorReducer, {}));
  function descriptorReducer(all, name) {
    if (name in err) {
      return all;
    }
    all[name] = {
      enumerable: false,
      configurable: false,
      get() {
        log2(name);
        return err.git[name];
      }
    };
    return all;
  }
var init_task_callback = __esm2({
  "src/lib/task-callback.ts"() {
    init_git_response_error();
    init_utils();
});
function changeWorkingDirectoryTask(directory, root) {
  return adhocExecTask((instance6) => {
    if (!folderExists(directory)) {
      throw new Error(`Git.cwd: cannot change to non-directory "${directory}"`);
    return (root || instance6).cwd = directory;
  });
}
var init_change_working_directory = __esm2({
  "src/lib/tasks/change-working-directory.ts"() {
    init_utils();
    init_task();
});
function parseCommitResult(stdOut) {
  const result = {
    author: null,
    branch: "",
    commit: "",
    root: false,
    summary: {
      changes: 0,
      insertions: 0,
      deletions: 0
    }
  };
  return parseStringResponse(result, parsers, stdOut);
var parsers;
var init_parse_commit = __esm2({
  "src/lib/parsers/parse-commit.ts"() {
    parsers = [
      new LineParser(/^\[([^\s]+)( \([^)]+\))? ([^\]]+)/, (result, [branch2, root, commit2]) => {
        result.branch = branch2;
        result.commit = commit2;
        result.root = !!root;
      new LineParser(/\s*Author:\s(.+)/i, (result, [author]) => {
        const parts = author.split("<");
        const email = parts.pop();
        if (!email || !email.includes("@")) {
          return;
        }
        result.author = {
          email: email.substr(0, email.length - 1),
          name: parts.join("<").trim()
        };
      new LineParser(/(\d+)[^,]*(?:,\s*(\d+)[^,]*)(?:,\s*(\d+))/g, (result, [changes, insertions, deletions]) => {
        result.summary.changes = parseInt(changes, 10) || 0;
        result.summary.insertions = parseInt(insertions, 10) || 0;
        result.summary.deletions = parseInt(deletions, 10) || 0;
      new LineParser(/^(\d+)[^,]*(?:,\s*(\d+)[^(]+\(([+-]))?/, (result, [changes, lines, direction]) => {
        result.summary.changes = parseInt(changes, 10) || 0;
        const count = parseInt(lines, 10) || 0;
        if (direction === "-") {
          result.summary.deletions = count;
        } else if (direction === "+") {
          result.summary.insertions = count;
      })
    ];
var commit_exports = {};
__export2(commit_exports, {
  commitTask: () => commitTask,
  default: () => commit_default
});
function commitTask(message, files, customArgs) {
    "-c",
    "core.abbrev=40",
    "commit",
    ...prefixedArray(message, "-m"),
    ...files,
    ...customArgs
    format: "utf-8",
    parser: parseCommitResult
  };
}
function commit_default() {
  return {
    commit(message, ...rest) {
      const next = trailingFunctionArgument(arguments);
      const task = rejectDeprecatedSignatures(message) || commitTask(asArray(message), asArray(filterType(rest[0], filterStringOrStringArray, [])), [...filterType(rest[1], filterArray, []), ...getTrailingOptions(arguments, 0, true)]);
      return this._runTask(task, next);
  function rejectDeprecatedSignatures(message) {
    return !filterStringOrStringArray(message) && configurationErrorTask(`git.commit: requires the commit message to be supplied as a string/string[]`);
  }
var init_commit = __esm2({
  "src/lib/tasks/commit.ts"() {
    init_parse_commit();
    init_utils();
    init_task();
function hashObjectTask(filePath, write) {
  const commands = ["hash-object", filePath];
  if (write) {
    commands.push("-w");
  }
  return straightThroughStringTask(commands, true);
var init_hash_object = __esm2({
  "src/lib/tasks/hash-object.ts"() {
    init_task();
  }
});
function parseInit(bare, path2, text2) {
  const response = String(text2).trim();
  let result;
  if (result = initResponseRegex.exec(response)) {
    return new InitSummary(bare, path2, false, result[1]);
  }
  if (result = reInitResponseRegex.exec(response)) {
    return new InitSummary(bare, path2, true, result[1]);
  }
  let gitDir = "";
  const tokens = response.split(" ");
  while (tokens.length) {
    const token = tokens.shift();
    if (token === "in") {
      gitDir = tokens.join(" ");
      break;
    }
  }
  return new InitSummary(bare, path2, /^re/i.test(response), gitDir);
var InitSummary;
var initResponseRegex;
var reInitResponseRegex;
var init_InitSummary = __esm2({
  "src/lib/responses/InitSummary.ts"() {
    InitSummary = class {
      constructor(bare, path2, existing, gitDir) {
        this.bare = bare;
        this.path = path2;
        this.existing = existing;
        this.gitDir = gitDir;
      }
    };
    initResponseRegex = /^Init.+ repository in (.+)$/;
    reInitResponseRegex = /^Rein.+ in (.+)$/;
  }
});
function hasBareCommand(command) {
  return command.includes(bareCommand);
}
function initTask(bare = false, path2, customArgs) {
  const commands = ["init", ...customArgs];
  if (bare && !hasBareCommand(commands)) {
    commands.splice(1, 0, bareCommand);
  }
    commands,
    format: "utf-8",
    parser(text2) {
      return parseInit(commands.includes("--bare"), path2, text2);
var bareCommand;
var init_init = __esm2({
  "src/lib/tasks/init.ts"() {
    init_InitSummary();
    bareCommand = "--bare";
function logFormatFromCommand(customArgs) {
  for (let i = 0; i < customArgs.length; i++) {
    const format = logFormatRegex.exec(customArgs[i]);
    if (format) {
      return `--${format[1]}`;
    }
  }
  return "";
}
function isLogFormat(customArg) {
  return logFormatRegex.test(customArg);
}
var logFormatRegex;
var init_log_format = __esm2({
  "src/lib/args/log-format.ts"() {
    logFormatRegex = /^--(stat|numstat|name-only|name-status)(=|$)/;
  }
var DiffSummary;
var init_DiffSummary = __esm2({
  "src/lib/responses/DiffSummary.ts"() {
    DiffSummary = class {
      constructor() {
        this.changed = 0;
        this.deletions = 0;
        this.insertions = 0;
        this.files = [];
function getDiffParser(format = "") {
  const parser3 = diffSummaryParsers[format];
  return (stdOut) => parseStringResponse(new DiffSummary(), parser3, stdOut, false);
}
var statParser;
var numStatParser;
var nameOnlyParser;
var nameStatusParser;
var diffSummaryParsers;
var init_parse_diff_summary = __esm2({
  "src/lib/parsers/parse-diff-summary.ts"() {
    init_log_format();
    init_DiffSummary();
    statParser = [
      new LineParser(/(.+)\s+\|\s+(\d+)(\s+[+\-]+)?$/, (result, [file, changes, alterations = ""]) => {
        result.files.push({
          file: file.trim(),
          changes: asNumber(changes),
          insertions: alterations.replace(/[^+]/g, "").length,
          deletions: alterations.replace(/[^-]/g, "").length,
          binary: false
      }),
      new LineParser(/(.+) \|\s+Bin ([0-9.]+) -> ([0-9.]+) ([a-z]+)/, (result, [file, before, after]) => {
        result.files.push({
          file: file.trim(),
          before: asNumber(before),
          after: asNumber(after),
          binary: true
        });
      }),
      new LineParser(/(\d+) files? changed\s*((?:, \d+ [^,]+){0,2})/, (result, [changed, summary]) => {
        const inserted = /(\d+) i/.exec(summary);
        const deleted = /(\d+) d/.exec(summary);
        result.changed = asNumber(changed);
        result.insertions = asNumber(inserted == null ? void 0 : inserted[1]);
        result.deletions = asNumber(deleted == null ? void 0 : deleted[1]);
      })
    ];
    numStatParser = [
      new LineParser(/(\d+)\t(\d+)\t(.+)$/, (result, [changesInsert, changesDelete, file]) => {
        const insertions = asNumber(changesInsert);
        const deletions = asNumber(changesDelete);
        result.changed++;
        result.insertions += insertions;
        result.deletions += deletions;
        result.files.push({
          file,
          changes: insertions + deletions,
          insertions,
          deletions,
          binary: false
        });
      }),
      new LineParser(/-\t-\t(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          after: 0,
          before: 0,
          binary: true
        });
      })
    ];
    nameOnlyParser = [
      new LineParser(/(.+)$/, (result, [file]) => {
        result.changed++;
        result.files.push({
          file,
          changes: 0,
          insertions: 0,
          deletions: 0,
          binary: false
        });
      })
    ];
    nameStatusParser = [
      new LineParser(/([ACDMRTUXB])\s*(.+)$/, (result, [_status, file]) => {
        result.changed++;
        result.files.push({
          file,
          changes: 0,
          insertions: 0,
          deletions: 0,
          binary: false
        });
      })
    ];
    diffSummaryParsers = {
      [""]: statParser,
      ["--stat"]: statParser,
      ["--numstat"]: numStatParser,
      ["--name-status"]: nameStatusParser,
      ["--name-only"]: nameOnlyParser
function lineBuilder(tokens, fields) {
  return fields.reduce((line, field, index2) => {
    line[field] = tokens[index2] || "";
    return line;
  }, /* @__PURE__ */ Object.create({ diff: null }));
function createListLogSummaryParser(splitter = SPLITTER, fields = defaultFieldNames, logFormat = "") {
  const parseDiffResult = getDiffParser(logFormat);
  return function(stdOut) {
    const all = toLinesWithContent(stdOut, true, START_BOUNDARY).map(function(item) {
      const lineDetail = item.trim().split(COMMIT_BOUNDARY);
      const listLogLine = lineBuilder(lineDetail[0].trim().split(splitter), fields);
      if (lineDetail.length > 1 && !!lineDetail[1].trim()) {
        listLogLine.diff = parseDiffResult(lineDetail[1]);
      }
      return listLogLine;
    });
    return {
      all,
      latest: all.length && all[0] || null,
      total: all.length
    };
  };
}
var START_BOUNDARY;
var COMMIT_BOUNDARY;
var SPLITTER;
var defaultFieldNames;
var init_parse_list_log_summary = __esm2({
  "src/lib/parsers/parse-list-log-summary.ts"() {
    init_utils();
    init_parse_diff_summary();
    init_log_format();
    START_BOUNDARY = "\xF2\xF2\xF2\xF2\xF2\xF2 ";
    COMMIT_BOUNDARY = " \xF2\xF2";
    SPLITTER = " \xF2 ";
    defaultFieldNames = ["hash", "date", "message", "refs", "author_name", "author_email"];
var diff_exports = {};
__export2(diff_exports, {
  diffSummaryTask: () => diffSummaryTask,
  validateLogFormatConfig: () => validateLogFormatConfig
});
function diffSummaryTask(customArgs) {
  let logFormat = logFormatFromCommand(customArgs);
  const commands = ["diff"];
  if (logFormat === "") {
    logFormat = "--stat";
    commands.push("--stat=4096");
  }
  commands.push(...customArgs);
  return validateLogFormatConfig(commands) || {
    commands,
    format: "utf-8",
    parser: getDiffParser(logFormat)
function validateLogFormatConfig(customArgs) {
  const flags = customArgs.filter(isLogFormat);
  if (flags.length > 1) {
    return configurationErrorTask(`Summary flags are mutually exclusive - pick one of ${flags.join(",")}`);
  }
  if (flags.length && customArgs.includes("-z")) {
    return configurationErrorTask(`Summary flag ${flags} parsing is not compatible with null termination option '-z'`);
  }
var init_diff = __esm2({
  "src/lib/tasks/diff.ts"() {
    init_log_format();
    init_parse_diff_summary();
    init_task();
function prettyFormat(format, splitter) {
  const fields = [];
  const formatStr = [];
  Object.keys(format).forEach((field) => {
    fields.push(field);
    formatStr.push(String(format[field]));
  });
  return [fields, formatStr.join(splitter)];
function userOptions(input) {
  return Object.keys(input).reduce((out, key2) => {
    if (!(key2 in excludeOptions)) {
      out[key2] = input[key2];
    }
    return out;
  }, {});
function parseLogOptions(opt = {}, customArgs = []) {
  const splitter = filterType(opt.splitter, filterString, SPLITTER);
  const format = !filterPrimitives(opt.format) && opt.format ? opt.format : {
    hash: "%H",
    date: opt.strictDate === false ? "%ai" : "%aI",
    message: "%s",
    refs: "%D",
    body: opt.multiLine ? "%B" : "%b",
    author_name: opt.mailMap !== false ? "%aN" : "%an",
    author_email: opt.mailMap !== false ? "%aE" : "%ae"
  };
  const [fields, formatStr] = prettyFormat(format, splitter);
  const suffix = [];
  const command = [
    `--pretty=format:${START_BOUNDARY}${formatStr}${COMMIT_BOUNDARY}`,
    ...customArgs
  ];
  const maxCount = opt.n || opt["max-count"] || opt.maxCount;
  if (maxCount) {
    command.push(`--max-count=${maxCount}`);
  if (opt.from || opt.to) {
    const rangeOperator = opt.symmetric !== false ? "..." : "..";
    suffix.push(`${opt.from || ""}${rangeOperator}${opt.to || ""}`);
  if (filterString(opt.file)) {
    suffix.push("--follow", opt.file);
  appendTaskOptions(userOptions(opt), command);
    fields,
    splitter,
    commands: [...command, ...suffix]
function logTask(splitter, fields, customArgs) {
  const parser3 = createListLogSummaryParser(splitter, fields, logFormatFromCommand(customArgs));
    commands: ["log", ...customArgs],
function log_default() {
    log(...rest) {
      const next = trailingFunctionArgument(arguments);
      const options = parseLogOptions(trailingOptionsArgument(arguments), filterType(arguments[0], filterArray));
      const task = rejectDeprecatedSignatures(...rest) || validateLogFormatConfig(options.commands) || createLogTask(options);
      return this._runTask(task, next);
  function createLogTask(options) {
    return logTask(options.splitter, options.fields, options.commands);
  }
  function rejectDeprecatedSignatures(from, to) {
    return filterString(from) && filterString(to) && configurationErrorTask(`git.log(string, string) should be replaced with git.log({ from: string, to: string })`);
  }
var excludeOptions;
var init_log = __esm2({
  "src/lib/tasks/log.ts"() {
    init_log_format();
    init_parse_list_log_summary();
    init_task();
    init_diff();
    excludeOptions = /* @__PURE__ */ ((excludeOptions2) => {
      excludeOptions2[excludeOptions2["--pretty"] = 0] = "--pretty";
      excludeOptions2[excludeOptions2["max-count"] = 1] = "max-count";
      excludeOptions2[excludeOptions2["maxCount"] = 2] = "maxCount";
      excludeOptions2[excludeOptions2["n"] = 3] = "n";
      excludeOptions2[excludeOptions2["file"] = 4] = "file";
      excludeOptions2[excludeOptions2["format"] = 5] = "format";
      excludeOptions2[excludeOptions2["from"] = 6] = "from";
      excludeOptions2[excludeOptions2["to"] = 7] = "to";
      excludeOptions2[excludeOptions2["splitter"] = 8] = "splitter";
      excludeOptions2[excludeOptions2["symmetric"] = 9] = "symmetric";
      excludeOptions2[excludeOptions2["mailMap"] = 10] = "mailMap";
      excludeOptions2[excludeOptions2["multiLine"] = 11] = "multiLine";
      excludeOptions2[excludeOptions2["strictDate"] = 12] = "strictDate";
      return excludeOptions2;
    })(excludeOptions || {});
var MergeSummaryConflict;
var MergeSummaryDetail;
var init_MergeSummary = __esm2({
  "src/lib/responses/MergeSummary.ts"() {
    MergeSummaryConflict = class {
      constructor(reason, file = null, meta) {
        this.reason = reason;
        this.file = file;
        this.meta = meta;
      }
      toString() {
        return `${this.file}:${this.reason}`;
      }
    };
    MergeSummaryDetail = class {
      constructor() {
        this.conflicts = [];
        this.merges = [];
        this.result = "success";
      }
      get failed() {
        return this.conflicts.length > 0;
      }
      get reason() {
        return this.result;
      }
      toString() {
        if (this.conflicts.length) {
          return `CONFLICTS: ${this.conflicts.join(", ")}`;
        }
        return "OK";
      }
var PullSummary;
var PullFailedSummary;
var init_PullSummary = __esm2({
  "src/lib/responses/PullSummary.ts"() {
    PullSummary = class {
      constructor() {
        this.remoteMessages = {
          all: []
        };
        this.created = [];
        this.deleted = [];
        this.files = [];
        this.deletions = {};
        this.insertions = {};
        this.summary = {
          changes: 0,
          deletions: 0,
          insertions: 0
        };
      }
    };
    PullFailedSummary = class {
      constructor() {
        this.remote = "";
        this.hash = {
          local: "",
          remote: ""
        };
        this.branch = {
          local: "",
          remote: ""
        };
        this.message = "";
      }
      toString() {
        return this.message;
      }
    };
function objectEnumerationResult(remoteMessages) {
  return remoteMessages.objects = remoteMessages.objects || {
    compressing: 0,
    counting: 0,
    enumerating: 0,
    packReused: 0,
    reused: { count: 0, delta: 0 },
    total: { count: 0, delta: 0 }
function asObjectCount(source) {
  const count = /^\s*(\d+)/.exec(source);
  const delta = /delta (\d+)/i.exec(source);
  return {
    count: asNumber(count && count[1] || "0"),
    delta: asNumber(delta && delta[1] || "0")
  };
}
var remoteMessagesObjectParsers;
var init_parse_remote_objects = __esm2({
  "src/lib/parsers/parse-remote-objects.ts"() {
    remoteMessagesObjectParsers = [
      new RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: (\d+),/i, (result, [action, count]) => {
        const key2 = action.toLowerCase();
        const enumeration = objectEnumerationResult(result.remoteMessages);
        Object.assign(enumeration, { [key2]: asNumber(count) });
      new RemoteLineParser(/^remote:\s*(enumerating|counting|compressing) objects: \d+% \(\d+\/(\d+)\),/i, (result, [action, count]) => {
        const key2 = action.toLowerCase();
        const enumeration = objectEnumerationResult(result.remoteMessages);
        Object.assign(enumeration, { [key2]: asNumber(count) });
      new RemoteLineParser(/total ([^,]+), reused ([^,]+), pack-reused (\d+)/i, (result, [total, reused, packReused]) => {
        const objects = objectEnumerationResult(result.remoteMessages);
        objects.total = asObjectCount(total);
        objects.reused = asObjectCount(reused);
        objects.packReused = asNumber(packReused);
function parseRemoteMessages(_stdOut, stdErr) {
  return parseStringResponse({ remoteMessages: new RemoteMessageSummary() }, parsers2, stdErr);
var parsers2;
var RemoteMessageSummary;
var init_parse_remote_messages = __esm2({
  "src/lib/parsers/parse-remote-messages.ts"() {
    init_utils();
    init_parse_remote_objects();
    parsers2 = [
      new RemoteLineParser(/^remote:\s*(.+)$/, (result, [text2]) => {
        result.remoteMessages.all.push(text2.trim());
        return false;
      }),
      ...remoteMessagesObjectParsers,
      new RemoteLineParser([/create a (?:pull|merge) request/i, /\s(https?:\/\/\S+)$/], (result, [pullRequestUrl]) => {
        result.remoteMessages.pullRequestUrl = pullRequestUrl;
      }),
      new RemoteLineParser([/found (\d+) vulnerabilities.+\(([^)]+)\)/i, /\s(https?:\/\/\S+)$/], (result, [count, summary, url]) => {
        result.remoteMessages.vulnerabilities = {
          count: asNumber(count),
          summary,
          url
        };
      })
    ];
    RemoteMessageSummary = class {
      constructor() {
        this.all = [];
      }
    };
function parsePullErrorResult(stdOut, stdErr) {
  const pullError = parseStringResponse(new PullFailedSummary(), errorParsers, [stdOut, stdErr]);
  return pullError.message && pullError;
var FILE_UPDATE_REGEX;
var SUMMARY_REGEX;
var ACTION_REGEX;
var parsers3;
var errorParsers;
var parsePullDetail;
var parsePullResult;
var init_parse_pull = __esm2({
  "src/lib/parsers/parse-pull.ts"() {
    init_PullSummary();
    init_parse_remote_messages();
    FILE_UPDATE_REGEX = /^\s*(.+?)\s+\|\s+\d+\s*(\+*)(-*)/;
    SUMMARY_REGEX = /(\d+)\D+((\d+)\D+\(\+\))?(\D+(\d+)\D+\(-\))?/;
    ACTION_REGEX = /^(create|delete) mode \d+ (.+)/;
    parsers3 = [
      new LineParser(FILE_UPDATE_REGEX, (result, [file, insertions, deletions]) => {
        result.files.push(file);
        if (insertions) {
          result.insertions[file] = insertions.length;
        }
        if (deletions) {
          result.deletions[file] = deletions.length;
        }
      }),
      new LineParser(SUMMARY_REGEX, (result, [changes, , insertions, , deletions]) => {
        if (insertions !== void 0 || deletions !== void 0) {
          result.summary.changes = +changes || 0;
          result.summary.insertions = +insertions || 0;
          result.summary.deletions = +deletions || 0;
          return true;
        }
        return false;
      }),
      new LineParser(ACTION_REGEX, (result, [action, file]) => {
        append(result.files, file);
        append(action === "create" ? result.created : result.deleted, file);
      })
    ];
    errorParsers = [
      new LineParser(/^from\s(.+)$/i, (result, [remote]) => void (result.remote = remote)),
      new LineParser(/^fatal:\s(.+)$/, (result, [message]) => void (result.message = message)),
      new LineParser(/([a-z0-9]+)\.\.([a-z0-9]+)\s+(\S+)\s+->\s+(\S+)$/, (result, [hashLocal, hashRemote, branchLocal, branchRemote]) => {
        result.branch.local = branchLocal;
        result.hash.local = hashLocal;
        result.branch.remote = branchRemote;
        result.hash.remote = hashRemote;
    parsePullDetail = (stdOut, stdErr) => {
      return parseStringResponse(new PullSummary(), parsers3, [stdOut, stdErr]);
    };
    parsePullResult = (stdOut, stdErr) => {
      return Object.assign(new PullSummary(), parsePullDetail(stdOut, stdErr), parseRemoteMessages(stdOut, stdErr));
    };
var parsers4;
var parseMergeResult;
var parseMergeDetail;
var init_parse_merge = __esm2({
  "src/lib/parsers/parse-merge.ts"() {
    init_MergeSummary();
    init_parse_pull();
    parsers4 = [
      new LineParser(/^Auto-merging\s+(.+)$/, (summary, [autoMerge]) => {
        summary.merges.push(autoMerge);
      }),
      new LineParser(/^CONFLICT\s+\((.+)\): Merge conflict in (.+)$/, (summary, [reason, file]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, file));
      }),
      new LineParser(/^CONFLICT\s+\((.+\/delete)\): (.+) deleted in (.+) and/, (summary, [reason, file, deleteRef2]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, file, { deleteRef: deleteRef2 }));
      }),
      new LineParser(/^CONFLICT\s+\((.+)\):/, (summary, [reason]) => {
        summary.conflicts.push(new MergeSummaryConflict(reason, null));
      }),
      new LineParser(/^Automatic merge failed;\s+(.+)$/, (summary, [result]) => {
        summary.result = result;
      })
    ];
    parseMergeResult = (stdOut, stdErr) => {
      return Object.assign(parseMergeDetail(stdOut, stdErr), parsePullResult(stdOut, stdErr));
    };
    parseMergeDetail = (stdOut) => {
      return parseStringResponse(new MergeSummaryDetail(), parsers4, stdOut);
    };
function mergeTask(customArgs) {
  if (!customArgs.length) {
    return configurationErrorTask("Git.merge requires at least one option");
    commands: ["merge", ...customArgs],
      const merge2 = parseMergeResult(stdOut, stdErr);
      if (merge2.failed) {
        throw new GitResponseError(merge2);
      return merge2;
var init_merge = __esm2({
  "src/lib/tasks/merge.ts"() {
    init_parse_merge();
    init_task();
function pushResultPushedItem(local, remote, status2) {
  const deleted = status2.includes("deleted");
  const tag2 = status2.includes("tag") || /^refs\/tags/.test(local);
  const alreadyUpdated = !status2.includes("new");
  return {
    deleted,
    tag: tag2,
    branch: !tag2,
    new: !alreadyUpdated,
    alreadyUpdated,
    local,
    remote
  };
var parsers5;
var parsePushResult;
var parsePushDetail;
var init_parse_push = __esm2({
  "src/lib/parsers/parse-push.ts"() {
    init_parse_remote_messages();
    parsers5 = [
      new LineParser(/^Pushing to (.+)$/, (result, [repo]) => {
        result.repo = repo;
      }),
      new LineParser(/^updating local tracking ref '(.+)'/, (result, [local]) => {
        result.ref = __spreadProps(__spreadValues({}, result.ref || {}), {
          local
        });
      }),
      new LineParser(/^[*-=]\s+([^:]+):(\S+)\s+\[(.+)]$/, (result, [local, remote, type]) => {
        result.pushed.push(pushResultPushedItem(local, remote, type));
      }),
      new LineParser(/^Branch '([^']+)' set up to track remote branch '([^']+)' from '([^']+)'/, (result, [local, remote, remoteName]) => {
        result.branch = __spreadProps(__spreadValues({}, result.branch || {}), {
          local,
          remote,
          remoteName
        });
      }),
      new LineParser(/^([^:]+):(\S+)\s+([a-z0-9]+)\.\.([a-z0-9]+)$/, (result, [local, remote, from, to]) => {
        result.update = {
          head: {
            local,
            remote
          },
          hash: {
            from,
            to
          }
        };
      })
    ];
    parsePushResult = (stdOut, stdErr) => {
      const pushDetail = parsePushDetail(stdOut, stdErr);
      const responseDetail = parseRemoteMessages(stdOut, stdErr);
      return __spreadValues(__spreadValues({}, pushDetail), responseDetail);
    };
    parsePushDetail = (stdOut, stdErr) => {
      return parseStringResponse({ pushed: [] }, parsers5, [stdOut, stdErr]);
    };
var push_exports = {};
__export2(push_exports, {
  pushTagsTask: () => pushTagsTask,
  pushTask: () => pushTask
function pushTagsTask(ref = {}, customArgs) {
  append(customArgs, "--tags");
  return pushTask(ref, customArgs);
function pushTask(ref = {}, customArgs) {
  const commands = ["push", ...customArgs];
  if (ref.branch) {
    commands.splice(1, 0, ref.branch);
  if (ref.remote) {
    commands.splice(1, 0, ref.remote);
  }
  remove2(commands, "-v");
  append(commands, "--verbose");
  append(commands, "--porcelain");
    parser: parsePushResult
var init_push = __esm2({
  "src/lib/tasks/push.ts"() {
    init_parse_push();
    init_utils();
var fromPathRegex;
var FileStatusSummary;
var init_FileStatusSummary = __esm2({
  "src/lib/responses/FileStatusSummary.ts"() {
    fromPathRegex = /^(.+) -> (.+)$/;
    FileStatusSummary = class {
      constructor(path2, index2, working_dir) {
        this.path = path2;
        this.index = index2;
        this.working_dir = working_dir;
        if (index2 + working_dir === "R") {
          const detail = fromPathRegex.exec(path2) || [null, path2, path2];
          this.from = detail[1] || "";
          this.path = detail[2] || "";
        }
      }
    };
  }
function renamedFile(line) {
  const [to, from] = line.split(NULL);
  return {
    from: from || to,
    to
function parser2(indexX, indexY, handler) {
  return [`${indexX}${indexY}`, handler];
function conflicts(indexX, ...indexY) {
  return indexY.map((y) => parser2(indexX, y, (result, file) => append(result.conflicted, file)));
function splitLine(result, lineStr) {
  const trimmed2 = lineStr.trim();
  switch (" ") {
    case trimmed2.charAt(2):
      return data(trimmed2.charAt(0), trimmed2.charAt(1), trimmed2.substr(3));
    case trimmed2.charAt(1):
      return data(" ", trimmed2.charAt(0), trimmed2.substr(2));
    default:
      return;
  function data(index2, workingDir, path2) {
    const raw = `${index2}${workingDir}`;
    const handler = parsers6.get(raw);
    if (handler) {
      handler(result, path2);
    }
    if (raw !== "##" && raw !== "!!") {
      result.files.push(new FileStatusSummary(path2.replace(/\0.+$/, ""), index2, workingDir));
    }
var StatusSummary;
var parsers6;
var parseStatusSummary;
var init_StatusSummary = __esm2({
  "src/lib/responses/StatusSummary.ts"() {
    init_utils();
    init_FileStatusSummary();
    StatusSummary = class {
      constructor() {
        this.not_added = [];
        this.conflicted = [];
        this.created = [];
        this.deleted = [];
        this.ignored = void 0;
        this.modified = [];
        this.renamed = [];
        this.files = [];
        this.staged = [];
        this.ahead = 0;
        this.behind = 0;
        this.current = null;
        this.tracking = null;
        this.detached = false;
        this.isClean = () => {
          return !this.files.length;
        };
    parsers6 = new Map([
      parser2(" ", "A", (result, file) => append(result.created, file)),
      parser2(" ", "D", (result, file) => append(result.deleted, file)),
      parser2(" ", "M", (result, file) => append(result.modified, file)),
      parser2("A", " ", (result, file) => append(result.created, file) && append(result.staged, file)),
      parser2("A", "M", (result, file) => append(result.created, file) && append(result.staged, file) && append(result.modified, file)),
      parser2("D", " ", (result, file) => append(result.deleted, file) && append(result.staged, file)),
      parser2("M", " ", (result, file) => append(result.modified, file) && append(result.staged, file)),
      parser2("M", "M", (result, file) => append(result.modified, file) && append(result.staged, file)),
      parser2("R", " ", (result, file) => {
        append(result.renamed, renamedFile(file));
      }),
      parser2("R", "M", (result, file) => {
        const renamed = renamedFile(file);
        append(result.renamed, renamed);
        append(result.modified, renamed.to);
      }),
      parser2("!", "!", (_result, _file) => {
        append(_result.ignored = _result.ignored || [], _file);
      }),
      parser2("?", "?", (result, file) => append(result.not_added, file)),
      ...conflicts("A", "A", "U"),
      ...conflicts("D", "D", "U"),
      ...conflicts("U", "A", "D", "U"),
      [
        "##",
        (result, line) => {
          const aheadReg = /ahead (\d+)/;
          const behindReg = /behind (\d+)/;
          const currentReg = /^(.+?(?=(?:\.{3}|\s|$)))/;
          const trackingReg = /\.{3}(\S*)/;
          const onEmptyBranchReg = /\son\s([\S]+)$/;
          let regexResult;
          regexResult = aheadReg.exec(line);
          result.ahead = regexResult && +regexResult[1] || 0;
          regexResult = behindReg.exec(line);
          result.behind = regexResult && +regexResult[1] || 0;
          regexResult = currentReg.exec(line);
          result.current = regexResult && regexResult[1];
          regexResult = trackingReg.exec(line);
          result.tracking = regexResult && regexResult[1];
          regexResult = onEmptyBranchReg.exec(line);
          result.current = regexResult && regexResult[1] || result.current;
          result.detached = /\(no branch\)/.test(line);
        }
      ]
    ]);
    parseStatusSummary = function(text2) {
      const lines = text2.split(NULL);
      const status2 = new StatusSummary();
      for (let i = 0, l = lines.length; i < l; ) {
        let line = lines[i++].trim();
        if (!line) {
          continue;
        }
        if (line.charAt(0) === "R") {
          line += NULL + (lines[i++] || "");
        }
        splitLine(status2, line);
      return status2;
function statusTask(customArgs) {
  const commands = [
    "status",
    "--porcelain",
    "-b",
    "-u",
    "--null",
    ...customArgs.filter((arg) => !ignoredOptions.includes(arg))
  ];
    commands,
      return parseStatusSummary(text2);
var ignoredOptions;
var init_status = __esm2({
  "src/lib/tasks/status.ts"() {
    init_StatusSummary();
    ignoredOptions = ["--null", "-z"];
  }
});
function versionResponse(major = 0, minor = 0, patch = 0, agent = "", installed = true) {
  return Object.defineProperty({
    major,
    minor,
    patch,
    agent,
    installed
  }, "toString", {
    value() {
      return `${this.major}.${this.minor}.${this.patch}`;
    },
    configurable: false,
    enumerable: false
  });
function notInstalledResponse() {
  return versionResponse(0, 0, 0, "", false);
}
function version_default() {
    version() {
      return this._runTask({
        commands: ["--version"],
        format: "utf-8",
        parser: versionParser,
        onError(result, error, done, fail) {
          if (result.exitCode === -2) {
            return done(Buffer2.from(NOT_INSTALLED));
          }
          fail(error);
        }
      });
function versionParser(stdOut) {
  if (stdOut === NOT_INSTALLED) {
    return notInstalledResponse();
  }
  return parseStringResponse(versionResponse(0, 0, 0, stdOut), parsers7, stdOut);
}
var NOT_INSTALLED;
var parsers7;
var init_version = __esm2({
  "src/lib/tasks/version.ts"() {
    init_utils();
    NOT_INSTALLED = "installed=false";
    parsers7 = [
      new LineParser(/version (\d+)\.(\d+)\.(\d+)(?:\s*\((.+)\))?/, (result, [major, minor, patch, agent = ""]) => {
        Object.assign(result, versionResponse(asNumber(major), asNumber(minor), asNumber(patch), agent));
      }),
      new LineParser(/version (\d+)\.(\d+)\.(\D+)(.+)?$/, (result, [major, minor, patch, agent = ""]) => {
        Object.assign(result, versionResponse(asNumber(major), asNumber(minor), patch, agent));
      })
    ];
var simple_git_api_exports = {};
__export2(simple_git_api_exports, {
  SimpleGitApi: () => SimpleGitApi
});
var SimpleGitApi;
var init_simple_git_api = __esm2({
  "src/lib/simple-git-api.ts"() {
    init_task_callback();
    init_change_working_directory();
    init_commit();
    init_config();
    init_grep();
    init_hash_object();
    init_init();
    init_log();
    init_merge();
    init_push();
    init_status();
    init_task();
    init_version();
    init_utils();
    SimpleGitApi = class {
      constructor(_executor) {
        this._executor = _executor;
      _runTask(task, then) {
        const chain = this._executor.chain();
        const promise2 = chain.push(task);
        if (then) {
          taskCallback(task, promise2, then);
        }
        return Object.create(this, {
          then: { value: promise2.then.bind(promise2) },
          catch: { value: promise2.catch.bind(promise2) },
          _executor: { value: chain }
      add(files) {
        return this._runTask(straightThroughStringTask(["add", ...asArray(files)]), trailingFunctionArgument(arguments));
      }
      cwd(directory) {
        const next = trailingFunctionArgument(arguments);
        if (typeof directory === "string") {
          return this._runTask(changeWorkingDirectoryTask(directory, this._executor), next);
        }
        if (typeof (directory == null ? void 0 : directory.path) === "string") {
          return this._runTask(changeWorkingDirectoryTask(directory.path, directory.root && this._executor || void 0), next);
        return this._runTask(configurationErrorTask("Git.cwd: workingDirectory must be supplied as a string"), next);
      hashObject(path2, write) {
        return this._runTask(hashObjectTask(path2, write === true), trailingFunctionArgument(arguments));
      init(bare) {
        return this._runTask(initTask(bare === true, this._executor.cwd, getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
      merge() {
        return this._runTask(mergeTask(getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
      mergeFromTo(remote, branch2) {
        if (!(filterString(remote) && filterString(branch2))) {
          return this._runTask(configurationErrorTask(`Git.mergeFromTo requires that the 'remote' and 'branch' arguments are supplied as strings`));
        }
        return this._runTask(mergeTask([remote, branch2, ...getTrailingOptions(arguments)]), trailingFunctionArgument(arguments, false));
      }
      outputHandler(handler) {
        this._executor.outputHandler = handler;
        return this;
      }
      push() {
        const task = pushTask({
          remote: filterType(arguments[0], filterString),
          branch: filterType(arguments[1], filterString)
        }, getTrailingOptions(arguments));
        return this._runTask(task, trailingFunctionArgument(arguments));
      }
      stash() {
        return this._runTask(straightThroughStringTask(["stash", ...getTrailingOptions(arguments)]), trailingFunctionArgument(arguments));
      }
      status() {
        return this._runTask(statusTask(getTrailingOptions(arguments)), trailingFunctionArgument(arguments));
    Object.assign(SimpleGitApi.prototype, commit_default(), config_default(), grep_default(), log_default(), version_default());
  }
});
var scheduler_exports = {};
__export2(scheduler_exports, {
  Scheduler: () => Scheduler
});
var createScheduledTask;
var Scheduler;
var init_scheduler = __esm2({
  "src/lib/runners/scheduler.ts"() {
    init_utils();
    init_git_logger();
    createScheduledTask = (() => {
      let id = 0;
      return () => {
        id++;
        const { promise: promise2, done } = (0, import_promise_deferred.createDeferred)();
        return {
          promise: promise2,
          done,
          id
        };
    })();
    Scheduler = class {
      constructor(concurrency = 2) {
        this.concurrency = concurrency;
        this.logger = createLogger("", "scheduler");
        this.pending = [];
        this.running = [];
        this.logger(`Constructed, concurrency=%s`, concurrency);
      }
      schedule() {
        if (!this.pending.length || this.running.length >= this.concurrency) {
          this.logger(`Schedule attempt ignored, pending=%s running=%s concurrency=%s`, this.pending.length, this.running.length, this.concurrency);
          return;
        }
        const task = append(this.running, this.pending.shift());
        this.logger(`Attempting id=%s`, task.id);
        task.done(() => {
          this.logger(`Completing id=`, task.id);
          remove2(this.running, task);
          this.schedule();
        });
      }
      next() {
        const { promise: promise2, id } = append(this.pending, createScheduledTask());
        this.logger(`Scheduling id=%s`, id);
        this.schedule();
        return promise2;
      }
var apply_patch_exports = {};
__export2(apply_patch_exports, {
  applyPatchTask: () => applyPatchTask
});
function applyPatchTask(patches, customArgs) {
  return straightThroughStringTask(["apply", ...customArgs, ...patches]);
}
var init_apply_patch = __esm2({
  "src/lib/tasks/apply-patch.ts"() {
    init_task();
});
function branchDeletionSuccess(branch2, hash2) {
  return {
    branch: branch2,
    hash: hash2,
    success: true
function branchDeletionFailure(branch2) {
    branch: branch2,
    hash: null,
    success: false
var BranchDeletionBatch;
var init_BranchDeleteSummary = __esm2({
  "src/lib/responses/BranchDeleteSummary.ts"() {
    BranchDeletionBatch = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.errors = [];
      }
      get success() {
        return !this.errors.length;
      }
});
function hasBranchDeletionError(data, processExitCode) {
  return processExitCode === 1 && deleteErrorRegex.test(data);
}
var deleteSuccessRegex;
var deleteErrorRegex;
var parsers8;
var parseBranchDeletions;
var init_parse_branch_delete = __esm2({
  "src/lib/parsers/parse-branch-delete.ts"() {
    init_BranchDeleteSummary();
    init_utils();
    deleteSuccessRegex = /(\S+)\s+\(\S+\s([^)]+)\)/;
    deleteErrorRegex = /^error[^']+'([^']+)'/m;
    parsers8 = [
      new LineParser(deleteSuccessRegex, (result, [branch2, hash2]) => {
        const deletion = branchDeletionSuccess(branch2, hash2);
        result.all.push(deletion);
        result.branches[branch2] = deletion;
      }),
      new LineParser(deleteErrorRegex, (result, [branch2]) => {
        const deletion = branchDeletionFailure(branch2);
        result.errors.push(deletion);
        result.all.push(deletion);
        result.branches[branch2] = deletion;
      })
    ];
    parseBranchDeletions = (stdOut, stdErr) => {
      return parseStringResponse(new BranchDeletionBatch(), parsers8, [stdOut, stdErr]);
    };
  }
});
var BranchSummaryResult;
var init_BranchSummary = __esm2({
  "src/lib/responses/BranchSummary.ts"() {
    BranchSummaryResult = class {
      constructor() {
        this.all = [];
        this.branches = {};
        this.current = "";
        this.detached = false;
      }
      push(status2, detached, name, commit2, label) {
        if (status2 === "*") {
          this.detached = detached;
          this.current = name;
        this.all.push(name);
        this.branches[name] = {
          current: status2 === "*",
          linkedWorkTree: status2 === "+",
          name,
          commit: commit2,
          label
        };
      }
    };
  }
});
function branchStatus(input) {
  return input ? input.charAt(0) : "";
function parseBranchSummary(stdOut) {
  return parseStringResponse(new BranchSummaryResult(), parsers9, stdOut);
var parsers9;
var init_parse_branch = __esm2({
  "src/lib/parsers/parse-branch.ts"() {
    init_BranchSummary();
    init_utils();
    parsers9 = [
      new LineParser(/^([*+]\s)?\((?:HEAD )?detached (?:from|at) (\S+)\)\s+([a-z0-9]+)\s(.*)$/, (result, [current, name, commit2, label]) => {
        result.push(branchStatus(current), true, name, commit2, label);
      }),
      new LineParser(/^([*+]\s)?(\S+)\s+([a-z0-9]+)\s?(.*)$/s, (result, [current, name, commit2, label]) => {
        result.push(branchStatus(current), false, name, commit2, label);
      })
    ];
  }
});
var branch_exports = {};
__export2(branch_exports, {
  branchLocalTask: () => branchLocalTask,
  branchTask: () => branchTask,
  containsDeleteBranchCommand: () => containsDeleteBranchCommand,
  deleteBranchTask: () => deleteBranchTask,
  deleteBranchesTask: () => deleteBranchesTask
});
function containsDeleteBranchCommand(commands) {
  const deleteCommands = ["-d", "-D", "--delete"];
  return commands.some((command) => deleteCommands.includes(command));
function branchTask(customArgs) {
  const isDelete = containsDeleteBranchCommand(customArgs);
  const commands = ["branch", ...customArgs];
  if (commands.length === 1) {
    commands.push("-a");
  }
  if (!commands.includes("-v")) {
    commands.splice(1, 0, "-v");
  }
  return {
    format: "utf-8",
    commands,
    parser(stdOut, stdErr) {
      if (isDelete) {
        return parseBranchDeletions(stdOut, stdErr).all[0];
      }
      return parseBranchSummary(stdOut);
function branchLocalTask() {
  const parser3 = parseBranchSummary;
    format: "utf-8",
    commands: ["branch", "-v"],
    parser: parser3
function deleteBranchesTask(branches, forceDelete = false) {
  return {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", ...branches],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr);
    },
    onError({ exitCode, stdOut }, error, done, fail) {
      if (!hasBranchDeletionError(String(error), exitCode)) {
        return fail(error);
      done(stdOut);
}
function deleteBranchTask(branch2, forceDelete = false) {
  const task = {
    format: "utf-8",
    commands: ["branch", "-v", forceDelete ? "-D" : "-d", branch2],
    parser(stdOut, stdErr) {
      return parseBranchDeletions(stdOut, stdErr).branches[branch2];
    },
    onError({ exitCode, stdErr, stdOut }, error, _, fail) {
      if (!hasBranchDeletionError(String(error), exitCode)) {
        return fail(error);
      throw new GitResponseError(task.parser(bufferToString(stdOut), bufferToString(stdErr)), String(error));
  return task;
var init_branch = __esm2({
  "src/lib/tasks/branch.ts"() {
    init_git_response_error();
    init_parse_branch_delete();
    init_parse_branch();
    init_utils();
  }
});
var parseCheckIgnore;
var init_CheckIgnore = __esm2({
  "src/lib/responses/CheckIgnore.ts"() {
    parseCheckIgnore = (text2) => {
      return text2.split(/\n/g).map((line) => line.trim()).filter((file) => !!file);
    };
  }
});
var check_ignore_exports = {};
__export2(check_ignore_exports, {
  checkIgnoreTask: () => checkIgnoreTask
});
function checkIgnoreTask(paths) {
    commands: ["check-ignore", ...paths],
    format: "utf-8",
    parser: parseCheckIgnore
var init_check_ignore = __esm2({
  "src/lib/tasks/check-ignore.ts"() {
    init_CheckIgnore();
});
var clone_exports = {};
__export2(clone_exports, {
  cloneMirrorTask: () => cloneMirrorTask,
  cloneTask: () => cloneTask
});
function disallowedCommand(command) {
  return /^--upload-pack(=|$)/.test(command);
function cloneTask(repo, directory, customArgs) {
  const commands = ["clone", ...customArgs];
  filterString(repo) && commands.push(repo);
  filterString(directory) && commands.push(directory);
  const banned = commands.find(disallowedCommand);
  if (banned) {
    return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
  return straightThroughStringTask(commands);
function cloneMirrorTask(repo, directory, customArgs) {
  append(customArgs, "--mirror");
  return cloneTask(repo, directory, customArgs);
}
var init_clone = __esm2({
  "src/lib/tasks/clone.ts"() {
    init_task();
    init_utils();
});
function parseFetchResult(stdOut, stdErr) {
  const result = {
    raw: stdOut,
    remote: null,
    branches: [],
    tags: [],
    updated: [],
    deleted: []
  };
  return parseStringResponse(result, parsers10, [stdOut, stdErr]);
}
var parsers10;
var init_parse_fetch = __esm2({
  "src/lib/parsers/parse-fetch.ts"() {
    init_utils();
    parsers10 = [
      new LineParser(/From (.+)$/, (result, [remote]) => {
        result.remote = remote;
      }),
      new LineParser(/\* \[new branch]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.branches.push({
          name,
          tracking
      }),
      new LineParser(/\* \[new tag]\s+(\S+)\s*-> (.+)$/, (result, [name, tracking]) => {
        result.tags.push({
          name,
          tracking
        });
      }),
      new LineParser(/- \[deleted]\s+\S+\s*-> (.+)$/, (result, [tracking]) => {
        result.deleted.push({
          tracking
        });
      }),
      new LineParser(/\s*([^.]+)\.\.(\S+)\s+(\S+)\s*-> (.+)$/, (result, [from, to, name, tracking]) => {
        result.updated.push({
          name,
          tracking,
          to,
          from
        });
      })
    ];
});
var fetch_exports = {};
__export2(fetch_exports, {
  fetchTask: () => fetchTask
});
function disallowedCommand2(command) {
  return /^--upload-pack(=|$)/.test(command);
}
function fetchTask(remote, branch2, customArgs) {
  const commands = ["fetch", ...customArgs];
  if (remote && branch2) {
    commands.push(remote, branch2);
  const banned = commands.find(disallowedCommand2);
  if (banned) {
    return configurationErrorTask(`git.fetch: potential exploit argument blocked.`);
  return {
    commands,
    format: "utf-8",
    parser: parseFetchResult
  };
}
var init_fetch = __esm2({
  "src/lib/tasks/fetch.ts"() {
    init_parse_fetch();
    init_task();
});
function parseMoveResult(stdOut) {
  return parseStringResponse({ moves: [] }, parsers11, stdOut);
}
var parsers11;
var init_parse_move = __esm2({
  "src/lib/parsers/parse-move.ts"() {
    init_utils();
    parsers11 = [
      new LineParser(/^Renaming (.+) to (.+)$/, (result, [from, to]) => {
        result.moves.push({ from, to });
      })
    ];
});
var move_exports = {};
__export2(move_exports, {
  moveTask: () => moveTask
});
function moveTask(from, to) {
  return {
    commands: ["mv", "-v", ...asArray(from), to],
    format: "utf-8",
    parser: parseMoveResult
  };
}
var init_move = __esm2({
  "src/lib/tasks/move.ts"() {
    init_parse_move();
    init_utils();
});
var pull_exports = {};
__export2(pull_exports, {
  pullTask: () => pullTask
});
function pullTask(remote, branch2, customArgs) {
  const commands = ["pull", ...customArgs];
  if (remote && branch2) {
    commands.splice(1, 0, remote, branch2);
  return {
    commands,
    format: "utf-8",
    parser(stdOut, stdErr) {
      return parsePullResult(stdOut, stdErr);
    },
    onError(result, _error, _done, fail) {
      const pullError = parsePullErrorResult(bufferToString(result.stdOut), bufferToString(result.stdErr));
      if (pullError) {
        return fail(new GitResponseError(pullError));
      fail(_error);
    }
  };
}
var init_pull = __esm2({
  "src/lib/tasks/pull.ts"() {
    init_git_response_error();
    init_parse_pull();
    init_utils();
});
function parseGetRemotes(text2) {
  const remotes = {};
  forEach(text2, ([name]) => remotes[name] = { name });
  return Object.values(remotes);
}
function parseGetRemotesVerbose(text2) {
  const remotes = {};
  forEach(text2, ([name, url, purpose]) => {
    if (!remotes.hasOwnProperty(name)) {
      remotes[name] = {
        name,
        refs: { fetch: "", push: "" }
    }
    if (purpose && url) {
      remotes[name].refs[purpose.replace(/[^a-z]/g, "")] = url;
    }
  });
  return Object.values(remotes);
}
function forEach(text2, handler) {
  forEachLineWithContent(text2, (line) => handler(line.split(/\s+/)));
}
var init_GetRemoteSummary = __esm2({
  "src/lib/responses/GetRemoteSummary.ts"() {
    init_utils();
});
var remote_exports = {};
__export2(remote_exports, {
  addRemoteTask: () => addRemoteTask,
  getRemotesTask: () => getRemotesTask,
  listRemotesTask: () => listRemotesTask,
  remoteTask: () => remoteTask,
  removeRemoteTask: () => removeRemoteTask
});
function addRemoteTask(remoteName, remoteRepo, customArgs = []) {
  return straightThroughStringTask(["remote", "add", ...customArgs, remoteName, remoteRepo]);
}
function getRemotesTask(verbose) {
  const commands = ["remote"];
  if (verbose) {
    commands.push("-v");
  return {
    commands,
    format: "utf-8",
    parser: verbose ? parseGetRemotesVerbose : parseGetRemotes
  };
}
function listRemotesTask(customArgs = []) {
  const commands = [...customArgs];
  if (commands[0] !== "ls-remote") {
    commands.unshift("ls-remote");
  return straightThroughStringTask(commands);
}
function remoteTask(customArgs = []) {
  const commands = [...customArgs];
  if (commands[0] !== "remote") {
    commands.unshift("remote");
  return straightThroughStringTask(commands);
}
function removeRemoteTask(remoteName) {
  return straightThroughStringTask(["remote", "remove", remoteName]);
}
var init_remote = __esm2({
  "src/lib/tasks/remote.ts"() {
    init_GetRemoteSummary();
    init_task();
});
var stash_list_exports = {};
__export2(stash_list_exports, {
  stashListTask: () => stashListTask
});
function stashListTask(opt = {}, customArgs) {
  const options = parseLogOptions(opt);
  const commands = ["stash", "list", ...options.commands, ...customArgs];
  const parser3 = createListLogSummaryParser(options.splitter, options.fields, logFormatFromCommand(commands));
  return validateLogFormatConfig(commands) || {
    commands,
    format: "utf-8",
    parser: parser3
  };
}
var init_stash_list = __esm2({
  "src/lib/tasks/stash-list.ts"() {
    init_log_format();
    init_parse_list_log_summary();
    init_diff();
    init_log();
});
var sub_module_exports = {};
__export2(sub_module_exports, {
  addSubModuleTask: () => addSubModuleTask,
  initSubModuleTask: () => initSubModuleTask,
  subModuleTask: () => subModuleTask,
  updateSubModuleTask: () => updateSubModuleTask
});
function addSubModuleTask(repo, path2) {
  return subModuleTask(["add", repo, path2]);
}
function initSubModuleTask(customArgs) {
  return subModuleTask(["init", ...customArgs]);
}
function subModuleTask(customArgs) {
  const commands = [...customArgs];
  if (commands[0] !== "submodule") {
    commands.unshift("submodule");
  return straightThroughStringTask(commands);
}
function updateSubModuleTask(customArgs) {
  return subModuleTask(["update", ...customArgs]);
}
var init_sub_module = __esm2({
  "src/lib/tasks/sub-module.ts"() {
    init_task();
});
function singleSorted(a, b) {
  const aIsNum = isNaN(a);
  const bIsNum = isNaN(b);
  if (aIsNum !== bIsNum) {
    return aIsNum ? 1 : -1;
  return aIsNum ? sorted(a, b) : 0;
}
function sorted(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}
function trimmed(input) {
  return input.trim();
}
function toNumber(input) {
  if (typeof input === "string") {
    return parseInt(input.replace(/^\D+/g, ""), 10) || 0;
  return 0;
}
var TagList;
var parseTagList;
var init_TagList = __esm2({
  "src/lib/responses/TagList.ts"() {
    TagList = class {
      constructor(all, latest) {
        this.all = all;
        this.latest = latest;
    };
    parseTagList = function(data, customSort = false) {
      const tags = data.split("\n").map(trimmed).filter(Boolean);
      if (!customSort) {
        tags.sort(function(tagA, tagB) {
          const partsA = tagA.split(".");
          const partsB = tagB.split(".");
          if (partsA.length === 1 || partsB.length === 1) {
            return singleSorted(toNumber(partsA[0]), toNumber(partsB[0]));
          }
          for (let i = 0, l = Math.max(partsA.length, partsB.length); i < l; i++) {
            const diff2 = sorted(toNumber(partsA[i]), toNumber(partsB[i]));
            if (diff2) {
              return diff2;
            }
          }
          return 0;
        });
      const latest = customSort ? tags[0] : [...tags].reverse().find((tag2) => tag2.indexOf(".") >= 0);
      return new TagList(tags, latest);
    };
});
var tag_exports = {};
__export2(tag_exports, {
  addAnnotatedTagTask: () => addAnnotatedTagTask,
  addTagTask: () => addTagTask,
  tagListTask: () => tagListTask
});
function tagListTask(customArgs = []) {
  const hasCustomSort = customArgs.some((option) => /^--sort=/.test(option));
  return {
    format: "utf-8",
    commands: ["tag", "-l", ...customArgs],
    parser(text2) {
      return parseTagList(text2, hasCustomSort);
  };
}
function addTagTask(name) {
  return {
    format: "utf-8",
    commands: ["tag", name],
    parser() {
      return { name };
    }
  };
}
function addAnnotatedTagTask(name, tagMessage) {
  return {
    format: "utf-8",
    commands: ["tag", "-a", "-m", tagMessage, name],
    parser() {
      return { name };
  };
}
var init_tag = __esm2({
  "src/lib/tasks/tag.ts"() {
    init_TagList();
});
var require_git = __commonJS2({
  "src/git.js"(exports, module2) {
    var { GitExecutor: GitExecutor2 } = (init_git_executor(), __toCommonJS(git_executor_exports));
    var { SimpleGitApi: SimpleGitApi2 } = (init_simple_git_api(), __toCommonJS(simple_git_api_exports));
    var { Scheduler: Scheduler2 } = (init_scheduler(), __toCommonJS(scheduler_exports));
    var { configurationErrorTask: configurationErrorTask2 } = (init_task(), __toCommonJS(task_exports));
    var {
      asArray: asArray2,
      filterArray: filterArray2,
      filterPrimitives: filterPrimitives2,
      filterString: filterString2,
      filterStringOrStringArray: filterStringOrStringArray2,
      filterType: filterType2,
      getTrailingOptions: getTrailingOptions2,
      trailingFunctionArgument: trailingFunctionArgument2,
      trailingOptionsArgument: trailingOptionsArgument2
    } = (init_utils(), __toCommonJS(utils_exports));
    var { applyPatchTask: applyPatchTask2 } = (init_apply_patch(), __toCommonJS(apply_patch_exports));
    var {
      branchTask: branchTask2,
      branchLocalTask: branchLocalTask2,
      deleteBranchesTask: deleteBranchesTask2,
      deleteBranchTask: deleteBranchTask2
    } = (init_branch(), __toCommonJS(branch_exports));
    var { checkIgnoreTask: checkIgnoreTask2 } = (init_check_ignore(), __toCommonJS(check_ignore_exports));
    var { checkIsRepoTask: checkIsRepoTask2 } = (init_check_is_repo(), __toCommonJS(check_is_repo_exports));
    var { cloneTask: cloneTask2, cloneMirrorTask: cloneMirrorTask2 } = (init_clone(), __toCommonJS(clone_exports));
    var { cleanWithOptionsTask: cleanWithOptionsTask2, isCleanOptionsArray: isCleanOptionsArray2 } = (init_clean(), __toCommonJS(clean_exports));
    var { commitTask: commitTask2 } = (init_commit(), __toCommonJS(commit_exports));
    var { diffSummaryTask: diffSummaryTask2 } = (init_diff(), __toCommonJS(diff_exports));
    var { fetchTask: fetchTask2 } = (init_fetch(), __toCommonJS(fetch_exports));
    var { moveTask: moveTask2 } = (init_move(), __toCommonJS(move_exports));
    var { pullTask: pullTask2 } = (init_pull(), __toCommonJS(pull_exports));
    var { pushTagsTask: pushTagsTask2 } = (init_push(), __toCommonJS(push_exports));
    var {
      addRemoteTask: addRemoteTask2,
      getRemotesTask: getRemotesTask2,
      listRemotesTask: listRemotesTask2,
      remoteTask: remoteTask2,
      removeRemoteTask: removeRemoteTask2
    } = (init_remote(), __toCommonJS(remote_exports));
    var { getResetMode: getResetMode2, resetTask: resetTask2 } = (init_reset(), __toCommonJS(reset_exports));
    var { stashListTask: stashListTask2 } = (init_stash_list(), __toCommonJS(stash_list_exports));
    var {
      addSubModuleTask: addSubModuleTask2,
      initSubModuleTask: initSubModuleTask2,
      subModuleTask: subModuleTask2,
      updateSubModuleTask: updateSubModuleTask2
    } = (init_sub_module(), __toCommonJS(sub_module_exports));
    var { addAnnotatedTagTask: addAnnotatedTagTask2, addTagTask: addTagTask2, tagListTask: tagListTask2 } = (init_tag(), __toCommonJS(tag_exports));
    var { straightThroughBufferTask: straightThroughBufferTask2, straightThroughStringTask: straightThroughStringTask2 } = (init_task(), __toCommonJS(task_exports));
    function Git2(options, plugins) {
      this._executor = new GitExecutor2(options.binary, options.baseDir, new Scheduler2(options.maxConcurrentProcesses), plugins);
      this._trimmed = options.trimmed;
    (Git2.prototype = Object.create(SimpleGitApi2.prototype)).constructor = Git2;
    Git2.prototype.customBinary = function(command) {
      this._executor.binary = command;
      return this;
    };
    Git2.prototype.env = function(name, value) {
      if (arguments.length === 1 && typeof name === "object") {
        this._executor.env = name;
      } else {
        (this._executor.env = this._executor.env || {})[name] = value;
      return this;
    };
    Git2.prototype.stashList = function(options) {
      return this._runTask(stashListTask2(trailingOptionsArgument2(arguments) || {}, filterArray2(options) && options || []), trailingFunctionArgument2(arguments));
    };
    function createCloneTask(api, task, repoPath, localPath) {
      if (typeof repoPath !== "string") {
        return configurationErrorTask2(`git.${api}() requires a string 'repoPath'`);
      }
      return task(repoPath, filterType2(localPath, filterString2), getTrailingOptions2(arguments));
    Git2.prototype.clone = function() {
      return this._runTask(createCloneTask("clone", cloneTask2, ...arguments), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.mirror = function() {
      return this._runTask(createCloneTask("mirror", cloneMirrorTask2, ...arguments), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.mv = function(from, to) {
      return this._runTask(moveTask2(from, to), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkoutLatestTag = function(then) {
      var git = this;
      return this.pull(function() {
        git.tags(function(err, tags) {
          git.checkout(tags.latest, then);
    };
    Git2.prototype.pull = function(remote, branch2, options, then) {
      return this._runTask(pullTask2(filterType2(remote, filterString2), filterType2(branch2, filterString2), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.fetch = function(remote, branch2) {
      return this._runTask(fetchTask2(filterType2(remote, filterString2), filterType2(branch2, filterString2), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.silent = function(silence) {
      console.warn("simple-git deprecation notice: git.silent: logging should be configured using the `debug` library / `DEBUG` environment variable, this will be an error in version 3");
      return this;
    };
    Git2.prototype.tags = function(options, then) {
      return this._runTask(tagListTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rebase = function() {
      return this._runTask(straightThroughStringTask2(["rebase", ...getTrailingOptions2(arguments)]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.reset = function(mode) {
      return this._runTask(resetTask2(getResetMode2(mode), getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.revert = function(commit2) {
      const next = trailingFunctionArgument2(arguments);
      if (typeof commit2 !== "string") {
        return this._runTask(configurationErrorTask2("Commit must be a string"), next);
      return this._runTask(straightThroughStringTask2(["revert", ...getTrailingOptions2(arguments, 0, true), commit2]), next);
    };
    Git2.prototype.addTag = function(name) {
      const task = typeof name === "string" ? addTagTask2(name) : configurationErrorTask2("Git.addTag requires a tag name");
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.addAnnotatedTag = function(tagName, tagMessage) {
      return this._runTask(addAnnotatedTagTask2(tagName, tagMessage), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkout = function() {
      const commands = ["checkout", ...getTrailingOptions2(arguments, true)];
      return this._runTask(straightThroughStringTask2(commands), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkoutBranch = function(branchName, startPoint, then) {
      return this.checkout(["-b", branchName, startPoint], trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkoutLocalBranch = function(branchName, then) {
      return this.checkout(["-b", branchName], trailingFunctionArgument2(arguments));
    };
    Git2.prototype.deleteLocalBranch = function(branchName, forceDelete, then) {
      return this._runTask(deleteBranchTask2(branchName, typeof forceDelete === "boolean" ? forceDelete : false), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.deleteLocalBranches = function(branchNames, forceDelete, then) {
      return this._runTask(deleteBranchesTask2(branchNames, typeof forceDelete === "boolean" ? forceDelete : false), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.branch = function(options, then) {
      return this._runTask(branchTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.branchLocal = function(then) {
      return this._runTask(branchLocalTask2(), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.raw = function(commands) {
      const createRestCommands = !Array.isArray(commands);
      const command = [].slice.call(createRestCommands ? arguments : commands, 0);
      for (let i = 0; i < command.length && createRestCommands; i++) {
        if (!filterPrimitives2(command[i])) {
          command.splice(i, command.length - i);
          break;
        }
      command.push(...getTrailingOptions2(arguments, 0, true));
      var next = trailingFunctionArgument2(arguments);
      if (!command.length) {
        return this._runTask(configurationErrorTask2("Raw: must supply one or more command to execute"), next);
      }
      return this._runTask(straightThroughStringTask2(command, this._trimmed), next);
    };
    Git2.prototype.submoduleAdd = function(repo, path2, then) {
      return this._runTask(addSubModuleTask2(repo, path2), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.submoduleUpdate = function(args, then) {
      return this._runTask(updateSubModuleTask2(getTrailingOptions2(arguments, true)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.submoduleInit = function(args, then) {
      return this._runTask(initSubModuleTask2(getTrailingOptions2(arguments, true)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.subModule = function(options, then) {
      return this._runTask(subModuleTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.listRemote = function() {
      return this._runTask(listRemotesTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.addRemote = function(remoteName, remoteRepo, then) {
      return this._runTask(addRemoteTask2(remoteName, remoteRepo, getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.removeRemote = function(remoteName, then) {
      return this._runTask(removeRemoteTask2(remoteName), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.getRemotes = function(verbose, then) {
      return this._runTask(getRemotesTask2(verbose === true), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.remote = function(options, then) {
      return this._runTask(remoteTask2(getTrailingOptions2(arguments)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.tag = function(options, then) {
      const command = getTrailingOptions2(arguments);
      if (command[0] !== "tag") {
        command.unshift("tag");
      }
      return this._runTask(straightThroughStringTask2(command), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.updateServerInfo = function(then) {
      return this._runTask(straightThroughStringTask2(["update-server-info"]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.pushTags = function(remote, then) {
      const task = pushTagsTask2({ remote: filterType2(remote, filterString2) }, getTrailingOptions2(arguments));
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rm = function(files) {
      return this._runTask(straightThroughStringTask2(["rm", "-f", ...asArray2(files)]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.rmKeepLocal = function(files) {
      return this._runTask(straightThroughStringTask2(["rm", "--cached", ...asArray2(files)]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.catFile = function(options, then) {
      return this._catFile("utf-8", arguments);
    };
    Git2.prototype.binaryCatFile = function() {
      return this._catFile("buffer", arguments);
    };
    Git2.prototype._catFile = function(format, args) {
      var handler = trailingFunctionArgument2(args);
      var command = ["cat-file"];
      var options = args[0];
      if (typeof options === "string") {
        return this._runTask(configurationErrorTask2("Git.catFile: options must be supplied as an array of strings"), handler);
      }
      if (Array.isArray(options)) {
        command.push.apply(command, options);
      }
      const task = format === "buffer" ? straightThroughBufferTask2(command) : straightThroughStringTask2(command);
      return this._runTask(task, handler);
    };
    Git2.prototype.diff = function(options, then) {
      const task = filterString2(options) ? configurationErrorTask2("git.diff: supplying options as a single string is no longer supported, switch to an array of strings") : straightThroughStringTask2(["diff", ...getTrailingOptions2(arguments)]);
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.diffSummary = function() {
      return this._runTask(diffSummaryTask2(getTrailingOptions2(arguments, 1)), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.applyPatch = function(patches) {
      const task = !filterStringOrStringArray2(patches) ? configurationErrorTask2(`git.applyPatch requires one or more string patches as the first argument`) : applyPatchTask2(asArray2(patches), getTrailingOptions2([].slice.call(arguments, 1)));
      return this._runTask(task, trailingFunctionArgument2(arguments));
    };
    Git2.prototype.revparse = function() {
      const commands = ["rev-parse", ...getTrailingOptions2(arguments, true)];
      return this._runTask(straightThroughStringTask2(commands, true), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.show = function(options, then) {
      return this._runTask(straightThroughStringTask2(["show", ...getTrailingOptions2(arguments, 1)]), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.clean = function(mode, options, then) {
      const usingCleanOptionsArray = isCleanOptionsArray2(mode);
      const cleanMode = usingCleanOptionsArray && mode.join("") || filterType2(mode, filterString2) || "";
      const customArgs = getTrailingOptions2([].slice.call(arguments, usingCleanOptionsArray ? 1 : 0));
      return this._runTask(cleanWithOptionsTask2(cleanMode, customArgs), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.exec = function(then) {
      const task = {
        commands: [],
        format: "utf-8",
        parser() {
          if (typeof then === "function") {
            then();
          }
        }
      };
      return this._runTask(task);
    };
    Git2.prototype.clearQueue = function() {
      return this;
    };
    Git2.prototype.checkIgnore = function(pathnames, then) {
      return this._runTask(checkIgnoreTask2(asArray2(filterType2(pathnames, filterStringOrStringArray2, []))), trailingFunctionArgument2(arguments));
    };
    Git2.prototype.checkIsRepo = function(checkType, then) {
      return this._runTask(checkIsRepoTask2(filterType2(checkType, filterString2)), trailingFunctionArgument2(arguments));
    };
    module2.exports = Git2;
});
init_git_error();
var GitConstructError = class extends GitError {
  constructor(config, message) {
    super(void 0, message);
    this.config = config;
init_git_error();
init_git_error();
var GitPluginError = class extends GitError {
  constructor(task, plugin, message) {
    super(task, message);
    this.task = task;
    Object.setPrototypeOf(this, new.target.prototype);
};
init_git_response_error();
init_task_configuration_error();
init_check_is_repo();
init_clean();
init_config();
init_grep();
init_reset();
function abortPlugin(signal) {
  if (!signal) {
    return;
  const onSpawnAfter = {
    type: "spawn.after",
    action(_data, context) {
      function kill() {
        context.kill(new GitPluginError(void 0, "abort", "Abort signal received"));
      }
      signal.addEventListener("abort", kill);
      context.spawned.on("close", () => signal.removeEventListener("abort", kill));
    }
  };
  const onSpawnBefore = {
    type: "spawn.before",
    action(_data, context) {
      if (signal.aborted) {
        context.kill(new GitPluginError(void 0, "abort", "Abort already signaled"));
      }
    }
  };
  return [onSpawnBefore, onSpawnAfter];
}
function isConfigSwitch(arg) {
  return arg.trim().toLowerCase() === "-c";
}
function preventProtocolOverride(arg, next) {
  if (!isConfigSwitch(arg)) {
    return;
  if (!/^\s*protocol(.[a-z]+)?.allow/.test(next)) {
    return;
  throw new GitPluginError(void 0, "unsafe", "Configuring protocol.allow is not permitted without enabling allowUnsafeExtProtocol");
}
function blockUnsafeOperationsPlugin({
  allowUnsafeProtocolOverride = false
} = {}) {
  return {
    type: "spawn.args",
    action(args, _context) {
      args.forEach((current, index2) => {
        const next = index2 < args.length ? args[index2 + 1] : "";
        allowUnsafeProtocolOverride || preventProtocolOverride(current, next);
      });
      return args;
  };
init_utils();
function commandConfigPrefixingPlugin(configuration) {
  const prefix = prefixedArray(configuration, "-c");
  return {
    type: "spawn.args",
    action(data) {
      return [...prefix, ...data];
  };
init_utils();
var never = (0, import_promise_deferred2.deferred)().promise;
function completionDetectionPlugin({
  onClose = true,
  onExit = 50
} = {}) {
  function createEvents() {
    let exitCode = -1;
    const events = {
      close: (0, import_promise_deferred2.deferred)(),
      closeTimeout: (0, import_promise_deferred2.deferred)(),
      exit: (0, import_promise_deferred2.deferred)(),
      exitTimeout: (0, import_promise_deferred2.deferred)()
    };
    const result = Promise.race([
      onClose === false ? never : events.closeTimeout.promise,
      onExit === false ? never : events.exitTimeout.promise
    ]);
    configureTimeout(onClose, events.close, events.closeTimeout);
    configureTimeout(onExit, events.exit, events.exitTimeout);
      close(code) {
        exitCode = code;
        events.close.done();
      },
      exit(code) {
        exitCode = code;
        events.exit.done();
      },
      get exitCode() {
        return exitCode;
      },
      result
  }
  function configureTimeout(flag, event, timeout) {
    if (flag === false) {
      return;
    }
    (flag === true ? event.promise : event.promise.then(() => delay(flag))).then(timeout.done);
  }
  return {
    type: "spawn.after",
    action(_0, _1) {
      return __async(this, arguments, function* (_data, { spawned, close }) {
        var _a2, _b;
        const events = createEvents();
        let deferClose = true;
        let quickClose = () => void (deferClose = false);
        (_a2 = spawned.stdout) == null ? void 0 : _a2.on("data", quickClose);
        (_b = spawned.stderr) == null ? void 0 : _b.on("data", quickClose);
        spawned.on("error", quickClose);
        spawned.on("close", (code) => events.close(code));
        spawned.on("exit", (code) => events.exit(code));
        try {
          yield events.result;
          if (deferClose) {
            yield delay(50);
          }
          close(events.exitCode);
        } catch (err) {
          close(events.exitCode, err);
        }
      });
    }
  };
init_git_error();
function isTaskError(result) {
  return !!(result.exitCode && result.stdErr.length);
function getErrorMessage(result) {
  return Buffer2.concat([...result.stdOut, ...result.stdErr]);
function errorDetectionHandler(overwrite = false, isError = isTaskError, errorMessage = getErrorMessage) {
  return (error, result) => {
    if (!overwrite && error || !isError(result)) {
      return error;
    }
    return errorMessage(result);
  };
function errorDetectionPlugin(config) {
  return {
    type: "task.error",
    action(data, context) {
      const error = config(data.error, {
        stdErr: context.stdErr,
        stdOut: context.stdOut,
        exitCode: context.exitCode
      });
      if (Buffer2.isBuffer(error)) {
        return { error: new GitError(void 0, error.toString("utf-8")) };
      }
      return {
        error
      };
    }
  };
}
init_utils();
var PluginStore = class {
  constructor() {
    this.plugins = /* @__PURE__ */ new Set();
  }
  add(plugin) {
    const plugins = [];
    asArray(plugin).forEach((plugin2) => plugin2 && this.plugins.add(append(plugins, plugin2)));
    return () => {
      plugins.forEach((plugin2) => this.plugins.delete(plugin2));
    };
  }
  exec(type, data, context) {
    let output = data;
    const contextual = Object.freeze(Object.create(context));
    for (const plugin of this.plugins) {
      if (plugin.type === type) {
        output = plugin.action(output, contextual);
      }
    }
    return output;
  }
};
init_utils();
function progressMonitorPlugin(progress) {
  const progressCommand = "--progress";
  const progressMethods = ["checkout", "clone", "fetch", "pull", "push"];
  const onProgress = {
    type: "spawn.after",
    action(_data, context) {
      var _a2;
      if (!context.commands.includes(progressCommand)) {
        return;
      (_a2 = context.spawned.stderr) == null ? void 0 : _a2.on("data", (chunk) => {
        const message = /^([\s\S]+?):\s*(\d+)% \((\d+)\/(\d+)\)/.exec(chunk.toString("utf8"));
        if (!message) {
          return;
        }
        progress({
          method: context.method,
          stage: progressEventStage(message[1]),
          progress: asNumber(message[2]),
          processed: asNumber(message[3]),
          total: asNumber(message[4])
        });
      });
  };
  const onArgs = {
    type: "spawn.args",
    action(args, context) {
      if (!progressMethods.includes(context.method)) {
        return args;
      }
      return including(args, progressCommand);
    }
  };
  return [onArgs, onProgress];
function progressEventStage(input) {
  return String(input.toLowerCase().split(" ", 1)) || "unknown";
init_utils();
function spawnOptionsPlugin(spawnOptions) {
  const options = pick(spawnOptions, ["uid", "gid"]);
  return {
    type: "spawn.options",
    action(data) {
      return __spreadValues(__spreadValues({}, options), data);
    }
  };
function timeoutPlugin({
  block
}) {
  if (block > 0) {
    return {
      type: "spawn.after",
      action(_data, context) {
        var _a2, _b;
        let timeout;
        function wait3() {
          timeout && clearTimeout(timeout);
          timeout = setTimeout(kill, block);
        }
        function stop() {
          var _a3, _b2;
          (_a3 = context.spawned.stdout) == null ? void 0 : _a3.off("data", wait3);
          (_b2 = context.spawned.stderr) == null ? void 0 : _b2.off("data", wait3);
          context.spawned.off("exit", stop);
          context.spawned.off("close", stop);
          timeout && clearTimeout(timeout);
        }
        function kill() {
          stop();
          context.kill(new GitPluginError(void 0, "timeout", `block timeout reached`));
        }
        (_a2 = context.spawned.stdout) == null ? void 0 : _a2.on("data", wait3);
        (_b = context.spawned.stderr) == null ? void 0 : _b.on("data", wait3);
        context.spawned.on("exit", stop);
        context.spawned.on("close", stop);
        wait3();
      }
    };
  }
init_utils();
var Git = require_git();
function gitInstanceFactory(baseDir, options) {
  const plugins = new PluginStore();
  const config = createInstanceConfig(baseDir && (typeof baseDir === "string" ? { baseDir } : baseDir) || {}, options);
  if (!folderExists(config.baseDir)) {
    throw new GitConstructError(config, `Cannot use simple-git on a directory that does not exist`);
  if (Array.isArray(config.config)) {
    plugins.add(commandConfigPrefixingPlugin(config.config));
  plugins.add(blockUnsafeOperationsPlugin(config.unsafe));
  plugins.add(completionDetectionPlugin(config.completion));
  config.abort && plugins.add(abortPlugin(config.abort));
  config.progress && plugins.add(progressMonitorPlugin(config.progress));
  config.timeout && plugins.add(timeoutPlugin(config.timeout));
  config.spawnOptions && plugins.add(spawnOptionsPlugin(config.spawnOptions));
  plugins.add(errorDetectionPlugin(errorDetectionHandler(true)));
  config.errors && plugins.add(errorDetectionPlugin(config.errors));
  return new Git(config, plugins);
}
init_git_response_error();
var esm_default = gitInstanceFactory;

// src/simpleGit.ts
var SimpleGit = class extends GitManager {
  constructor(plugin) {
    super(plugin);
  }
  async setGitInstance(ignoreError = false) {
    if (this.isGitInstalled()) {
      const adapter = this.app.vault.adapter;
      const path2 = adapter.getBasePath();
      let basePath = path2;
      if (this.plugin.settings.basePath) {
        const exists2 = await adapter.exists((0, import_obsidian6.normalizePath)(this.plugin.settings.basePath));
        if (exists2) {
          basePath = path2 + import_path.sep + this.plugin.settings.basePath;
        } else if (!ignoreError) {
          new import_obsidian6.Notice("ObsidianGit: Base path does not exist");
        }
      }
      this.git = esm_default({
        baseDir: basePath,
        binary: this.plugin.localStorage.getGitPath() || void 0,
        config: ["core.quotepath=off"]
      });
      const env = this.plugin.localStorage.getPATHPaths();
      if (env.length > 0) {
        const path3 = process.env["PATH"] + ":" + env.join(":");
        process.env["PATH"] = path3;
      const debug2 = require_browser();
      debug2.enable("simple-git");
      await this.git.cwd(await this.git.revparse("--show-toplevel"));
  async status() {
    this.plugin.setState(PluginState.status);
    const status2 = await this.git.status((err) => this.onError(err));
    this.plugin.setState(PluginState.idle);
    return {
      changed: status2.files.filter((e) => e.working_dir !== " ").map((e) => {
        const res = this.formatPath(e);
        return {
          path: res.path,
          from: res.from,
          working_dir: e.working_dir === "?" ? "U" : e.working_dir,
          vault_path: this.getVaultPath(res.path)
        };
      }),
      staged: status2.files.filter((e) => e.index !== " " && e.index != "?").map((e) => {
        const res = this.formatPath(e, e.index === "R");
        return {
          path: res.path,
          from: res.from,
          index: e.index,
          vault_path: this.getVaultPath(res.path)
        };
      }),
      conflicted: status2.conflicted.map((path2) => this.formatPath({ path: path2 }).path)
  formatPath(path2, renamed = false) {
    function format(path3) {
      if (path3 == void 0)
        return void 0;
      if (path3.startsWith('"') && path3.endsWith('"')) {
        return path3.substring(1, path3.length - 1);
        return path3;
    if (renamed) {
      return {
        from: format(path2.from),
        path: format(path2.path)
      };
      return {
        path: format(path2.path)
      };
    }
  }
  async commitAll({ message }) {
    if (this.plugin.settings.updateSubmodules) {
      this.plugin.setState(PluginState.commit);
      await new Promise(async (resolve, reject) => {
        this.git.outputHandler(async (cmd, stdout, stderr, args) => {
          if (!(args.contains("submodule") && args.contains("foreach")))
            return;
          let body = "";
          const root = this.app.vault.adapter.getBasePath() + (this.plugin.settings.basePath ? "/" + this.plugin.settings.basePath : "");
          stdout.on("data", (chunk) => {
            body += chunk.toString("utf8");
          });
          stdout.on("end", async () => {
            const submods = body.split("\n");
            const strippedSubmods = submods.map((i) => {
              const submod = i.match(/'([^']*)'/);
              if (submod != void 0) {
                return root + "/" + submod[1] + import_path.sep;
              }
            });
            strippedSubmods.reverse();
            for (const item of strippedSubmods) {
              if (item != void 0) {
                await this.git.cwd({ path: item, root: false }).add("-A", (err) => this.onError(err));
                await this.git.cwd({ path: item, root: false }).commit(await this.formatCommitMessage(message), (err) => this.onError(err));
              }
            }
            resolve();
          });
        });
        await this.git.subModule(["foreach", "--recursive", ""]);
        this.git.outputHandler(() => {
        });
      });
    this.plugin.setState(PluginState.add);
    await this.git.add("-A", (err) => this.onError(err));
    this.plugin.setState(PluginState.commit);
    return (await this.git.commit(await this.formatCommitMessage(message), (err) => this.onError(err))).summary.changes;
  async commit(message) {
    this.plugin.setState(PluginState.commit);
    const res = (await this.git.commit(await this.formatCommitMessage(message), (err) => this.onError(err))).summary.changes;
    this.plugin.setState(PluginState.idle);
    return res;
  }
  async stage(path2, relativeToVault) {
    this.plugin.setState(PluginState.add);
    path2 = this.getPath(path2, relativeToVault);
    await this.git.add(["--", path2], (err) => this.onError(err));
    this.plugin.setState(PluginState.idle);
  }
  async stageAll({ dir }) {
    this.plugin.setState(PluginState.add);
    await this.git.add(dir != null ? dir : "-A", (err) => this.onError(err));
    this.plugin.setState(PluginState.idle);
  }
  async unstageAll({ dir }) {
    this.plugin.setState(PluginState.add);
    await this.git.reset(dir != void 0 ? ["--", dir] : [], (err) => this.onError(err));
    this.plugin.setState(PluginState.idle);
  }
  async unstage(path2, relativeToVault) {
    this.plugin.setState(PluginState.add);
    path2 = this.getPath(path2, relativeToVault);
    await this.git.reset(["--", path2], (err) => this.onError(err));
    this.plugin.setState(PluginState.idle);
  }
  async discard(filepath) {
    this.plugin.setState(PluginState.add);
    await this.git.checkout(["--", filepath], (err) => this.onError(err));
    this.plugin.setState(PluginState.idle);
  }
  async discardAll({ dir }) {
    return this.discard(dir != null ? dir : ".");
  }
  async pull() {
    this.plugin.setState(PluginState.pull);
    if (this.plugin.settings.updateSubmodules)
      await this.git.subModule(["update", "--remote", "--merge", "--recursive"], (err) => this.onError(err));
    const branchInfo = await this.branchInfo();
    const localCommit = await this.git.revparse([branchInfo.current], (err) => this.onError(err));
    await this.git.fetch((err) => this.onError(err));
    const upstreamCommit = await this.git.revparse([branchInfo.tracking], (err) => this.onError(err));
    if (localCommit !== upstreamCommit) {
      if (this.plugin.settings.syncMethod === "merge" || this.plugin.settings.syncMethod === "rebase") {
        try {
          switch (this.plugin.settings.syncMethod) {
            case "merge":
              await this.git.merge([branchInfo.tracking]);
              break;
            case "rebase":
              await this.git.rebase([branchInfo.tracking]);
          }
        } catch (err) {
          this.plugin.displayError(`Pull failed (${this.plugin.settings.syncMethod}): ${err.message}`);
          return;
        }
      } else if (this.plugin.settings.syncMethod === "reset") {
        try {
          await this.git.raw(["update-ref", `refs/heads/${branchInfo.current}`, upstreamCommit], (err) => this.onError(err));
          await this.unstageAll({});
        } catch (err) {
          this.plugin.displayError(`Sync failed (${this.plugin.settings.syncMethod}): ${err.message}`);
        }
      const afterMergeCommit = await this.git.revparse([branchInfo.current], (err) => this.onError(err));
      const filesChanged = await this.git.diff([`${localCommit}..${afterMergeCommit}`, "--name-only"]);
      return filesChanged.split(/\r\n|\r|\n/).filter((value) => value.length > 0).map((e) => {
        return {
          path: e,
          working_dir: "P",
          vault_path: this.getVaultPath(e)
        };
      });
    } else {
      return [];
  async push() {
    this.plugin.setState(PluginState.status);
    const status2 = await this.git.status();
    const trackingBranch = status2.tracking;
    const currentBranch2 = status2.current;
    const remoteChangedFiles = (await this.git.diffSummary([currentBranch2, trackingBranch, "--"], (err) => this.onError(err))).changed;
    this.plugin.setState(PluginState.push);
    if (this.plugin.settings.updateSubmodules) {
      await this.git.env({ ...process.env, "OBSIDIAN_GIT": 1 }).subModule(["foreach", "--recursive", `tracking=$(git for-each-ref --format='%(upstream:short)' "$(git symbolic-ref -q HEAD)"); echo $tracking; if [ ! -z "$(git diff --shortstat $tracking)" ]; then git push; fi`], (err) => this.onError(err));
    await this.git.env({ ...process.env, "OBSIDIAN_GIT": 1 }).push((err) => this.onError(err));
    return remoteChangedFiles;
  }
  async canPush() {
    if (this.plugin.settings.updateSubmodules === true) {
      return true;
    const status2 = await this.git.status((err) => this.onError(err));
    const trackingBranch = status2.tracking;
    const currentBranch2 = status2.current;
    const remoteChangedFiles = (await this.git.diffSummary([currentBranch2, trackingBranch, "--"])).changed;
    return remoteChangedFiles !== 0;
  }
  async checkRequirements() {
    if (!this.isGitInstalled()) {
      return "missing-git";
    if (!await this.git.checkIsRepo()) {
      return "missing-repo";
    return "valid";
  }
  async branchInfo() {
    const status2 = await this.git.status((err) => this.onError(err));
    const branches = await this.git.branch(["--no-color"], (err) => this.onError(err));
    return {
      current: status2.current || void 0,
      tracking: status2.tracking || void 0,
      branches: branches.all
    };
  }
  async getRemoteUrl(remote) {
    return await this.git.remote(["get-url", remote], (err, url) => this.onError(err)) || void 0;
  }
  async log(file, relativeToVault = true) {
    const path2 = this.getPath(file, relativeToVault);
    const res = await this.git.log({ file: path2 }, (err) => this.onError(err));
    return res.all;
  }
  async show(commitHash, file, relativeToVault = true) {
    const path2 = this.getPath(file, relativeToVault);
    return this.git.show([commitHash + ":" + path2], (err) => this.onError(err));
  }
  async checkout(branch2) {
    await this.git.checkout(branch2, (err) => this.onError(err));
  }
  async createBranch(branch2) {
    await this.git.checkout(["-b", branch2], (err) => this.onError(err));
  }
  async deleteBranch(branch2, force) {
    await this.git.branch([force ? "-D" : "-d", branch2], (err) => this.onError(err));
  }
  async branchIsMerged(branch2) {
    const notMergedBranches = await this.git.branch(["--no-merged"], (err) => this.onError(err));
    return !notMergedBranches.all.contains(branch2);
  }
  async init() {
    await this.git.init(false, (err) => this.onError(err));
  }
  async clone(url, dir) {
    await this.git.clone(url, path.join(this.app.vault.adapter.getBasePath(), dir), [], (err) => this.onError(err));
  }
  async setConfig(path2, value) {
    if (value == void 0) {
      await this.git.raw(["config", "--local", "--unset", path2]);
    } else {
      await this.git.addConfig(path2, value, (err) => this.onError(err));
  }
  async getConfig(path2) {
    const config = await this.git.listConfig("local", (err) => this.onError(err));
    return config.all[path2];
  }
  async fetch(remote) {
    await this.git.fetch(remote != void 0 ? [remote] : [], (err) => this.onError(err));
  }
  async setRemote(name, url) {
    if ((await this.getRemotes()).includes(name))
      await this.git.remote(["set-url", name, url], (err) => this.onError(err));
    else {
      await this.git.remote(["add", name, url], (err) => this.onError(err));
  }
  async getRemoteBranches(remote) {
    const res = await this.git.branch(["-r", "--list", `${remote}*`], (err) => this.onError(err));
    console.log(remote);
    console.log(res);
    const list = [];
    for (const item in res.branches) {
      list.push(res.branches[item].name);
    return list;
  }
  async getRemotes() {
    const res = await this.git.remote([], (err) => this.onError(err));
    if (res) {
      return res.trim().split("\n");
    } else {
      return [];
  }
  async removeRemote(remoteName) {
    await this.git.removeRemote(remoteName);
  }
  async updateUpstreamBranch(remoteBranch) {
    try {
      await this.git.branch(["--set-upstream-to", remoteBranch]);
    } catch (e) {
      console.error(e);
      try {
        await this.git.branch(["--set-upstream", remoteBranch]);
      } catch (e2) {
        console.error(e2);
        await this.git.push(["--set-upstream", ...remoteBranch.split("/")], (err) => this.onError(err));
  }
  updateGitPath(gitPath) {
    this.setGitInstance();
  }
  updateBasePath(basePath) {
    this.setGitInstance(true);
  }
  async getDiffString(filePath, stagedChanges = false) {
    if (stagedChanges)
      return await this.git.diff(["--cached", "--", filePath]);
    else
      return await this.git.diff(["--", filePath]);
  }
  async diff(file, commit1, commit2) {
    return await this.git.diff([`${commit1}..${commit2}`, "--", file]);
  }
  async getLastCommitTime() {
    const res = await this.git.log({ n: 1 }, (err) => this.onError(err));
    if (res != null && res.latest != null) {
      return new Date(res.latest.date);
  }
  isGitInstalled() {
    const command = (0, import_child_process2.spawnSync)(this.plugin.localStorage.getGitPath() || "git", ["--version"], {
      stdio: "ignore"
    });
    if (command.error) {
      console.error(command.error);
      return false;
    return true;
  }
  onError(error) {
    if (error) {
      const networkFailure = error.message.contains("Could not resolve host") || error.message.match(/ssh: connect to host .*? port .*?: Operation timed out/) || error.message.match(/ssh: connect to host .*? port .*?: Network is unreachable/);
      if (!networkFailure) {
        this.plugin.displayError(error.message);
        this.plugin.setState(PluginState.idle);
      } else if (!this.plugin.offlineMode) {
        this.plugin.displayError("Git: Going into offline mode. Future network errors will no longer be displayed.", 2e3);
      }
      if (networkFailure) {
        this.plugin.offlineMode = true;
        this.plugin.setState(PluginState.idle);
      }
  }
};

// src/settings.ts
var ObsidianGitSettingsTab = class extends import_obsidian7.PluginSettingTab {
  display() {
    const { containerEl } = this;
    const plugin = this.plugin;
    const commitOrBackup = plugin.settings.differentIntervalCommitAndPush ? "commit" : "backup";
    const gitReady = plugin.gitReady;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Git Backup settings" });
    if (!gitReady) {
      containerEl.createEl("p", { text: "Git is not ready. When all settings are correct you can configure auto backup, etc." });
    }
    if (gitReady) {
      containerEl.createEl("br");
      containerEl.createEl("h3", { text: "Automatic" });
      new import_obsidian7.Setting(containerEl).setName("Split automatic commit and push").setDesc("Enable to use separate timer for commit and push").addToggle((toggle) => toggle.setValue(plugin.settings.differentIntervalCommitAndPush).onChange((value) => {
        plugin.settings.differentIntervalCommitAndPush = value;
        plugin.saveSettings();
        plugin.clearAutoBackup();
        plugin.clearAutoPush();
        if (plugin.settings.autoSaveInterval > 0) {
          plugin.startAutoBackup(plugin.settings.autoSaveInterval);
        if (value && plugin.settings.autoPushInterval > 0) {
          plugin.startAutoPush(plugin.settings.autoPushInterval);
        this.display();
      }));
      new import_obsidian7.Setting(containerEl).setName(`Vault ${commitOrBackup} interval (minutes)`).setDesc(`${plugin.settings.differentIntervalCommitAndPush ? "Commit" : "Commit and push"} changes every X minutes. Set to 0 (default) to disable. (See below setting for further configuration!)`).addText((text2) => text2.setValue(String(plugin.settings.autoSaveInterval)).onChange((value) => {
        if (!isNaN(Number(value))) {
          plugin.settings.autoSaveInterval = Number(value);
          plugin.saveSettings();
          if (plugin.settings.autoSaveInterval > 0) {
            plugin.clearAutoBackup();
            plugin.startAutoBackup(plugin.settings.autoSaveInterval);
            new import_obsidian7.Notice(`Automatic ${commitOrBackup} enabled! Every ${plugin.settings.autoSaveInterval} minutes.`);
          } else if (plugin.settings.autoSaveInterval <= 0) {
            plugin.clearAutoBackup() && new import_obsidian7.Notice(`Automatic ${commitOrBackup} disabled!`);
          }
          new import_obsidian7.Notice("Please specify a valid number.");
      }));
      if (!plugin.settings.setLastSaveToLastCommit)
        new import_obsidian7.Setting(containerEl).setName(`Auto Backup after file change`).setDesc(`If turned on, do auto ${commitOrBackup} every ${plugin.settings.autoSaveInterval} minutes after last change. This also prevents auto ${commitOrBackup} while editing a file. If turned off, it's independent from last the change.`).addToggle((toggle) => toggle.setValue(plugin.settings.autoBackupAfterFileChange).onChange((value) => {
          plugin.settings.autoBackupAfterFileChange = value;
          this.display();
          plugin.saveSettings();
          plugin.clearAutoBackup();
          if (plugin.settings.autoSaveInterval > 0) {
            plugin.startAutoBackup(plugin.settings.autoSaveInterval);
          }
        }));
      if (!plugin.settings.autoBackupAfterFileChange)
        new import_obsidian7.Setting(containerEl).setName(`Auto ${commitOrBackup} after lastest commit`).setDesc(`If turned on, set last auto ${commitOrBackup} time to lastest commit`).addToggle((toggle) => toggle.setValue(plugin.settings.setLastSaveToLastCommit).onChange(async (value) => {
          plugin.settings.setLastSaveToLastCommit = value;
          plugin.saveSettings();
          this.display();
          plugin.clearAutoBackup();
          await plugin.setUpAutoBackup();
        }));
      if (plugin.settings.differentIntervalCommitAndPush) {
        new import_obsidian7.Setting(containerEl).setName(`Vault push interval (minutes)`).setDesc("Push changes every X minutes. Set to 0 (default) to disable.").addText((text2) => text2.setValue(String(plugin.settings.autoPushInterval)).onChange((value) => {
          if (!isNaN(Number(value))) {
            plugin.settings.autoPushInterval = Number(value);
            plugin.saveSettings();
            if (plugin.settings.autoPushInterval > 0) {
              plugin.clearAutoPush();
              plugin.startAutoPush(plugin.settings.autoPushInterval);
              new import_obsidian7.Notice(`Automatic push enabled! Every ${plugin.settings.autoPushInterval} minutes.`);
            } else if (plugin.settings.autoPushInterval <= 0) {
              plugin.clearAutoPush() && new import_obsidian7.Notice("Automatic push disabled!");
            }
          } else {
            new import_obsidian7.Notice("Please specify a valid number.");
          }
        }));
      }
      new import_obsidian7.Setting(containerEl).setName("Auto pull interval (minutes)").setDesc("Pull changes every X minutes. Set to 0 (default) to disable.").addText((text2) => text2.setValue(String(plugin.settings.autoPullInterval)).onChange((value) => {
        if (!isNaN(Number(value))) {
          plugin.settings.autoPullInterval = Number(value);
          plugin.saveSettings();
          if (plugin.settings.autoPullInterval > 0) {
            plugin.clearAutoPull();
            plugin.startAutoPull(plugin.settings.autoPullInterval);
            new import_obsidian7.Notice(`Automatic pull enabled! Every ${plugin.settings.autoPullInterval} minutes.`);
          } else if (plugin.settings.autoPullInterval <= 0) {
            plugin.clearAutoPull() && new import_obsidian7.Notice("Automatic pull disabled!");
          }
          new import_obsidian7.Notice("Please specify a valid number.");
      }));
      new import_obsidian7.Setting(containerEl).setName("Commit message on manual backup/commit").setDesc("Available placeholders: {{date}} (see below), {{hostname}} (see below) and {{numFiles}} (number of changed files in the commit)").addText((text2) => text2.setPlaceholder("vault backup: {{date}}").setValue(plugin.settings.commitMessage ? plugin.settings.commitMessage : "").onChange((value) => {
        plugin.settings.commitMessage = value;
        plugin.saveSettings();
      }));
      new import_obsidian7.Setting(containerEl).setName("Specify custom commit message on auto backup").setDesc("You will get a pop up to specify your message").addToggle((toggle) => toggle.setValue(plugin.settings.customMessageOnAutoBackup).onChange((value) => {
        plugin.settings.customMessageOnAutoBackup = value;
        plugin.saveSettings();
      }));
      new import_obsidian7.Setting(containerEl).setName("Commit message on auto backup/commit").setDesc("Available placeholders: {{date}} (see below), {{hostname}} (see below) and {{numFiles}} (number of changed files in the commit)").addText((text2) => text2.setPlaceholder("vault backup: {{date}}").setValue(plugin.settings.autoCommitMessage).onChange((value) => {
        plugin.settings.autoCommitMessage = value;
        plugin.saveSettings();
      }));
      containerEl.createEl("br");
      containerEl.createEl("h3", { text: "Commit message" });
      new import_obsidian7.Setting(containerEl).setName("{{date}} placeholder format").setDesc('Specify custom date format. E.g. "YYYY-MM-DD HH:mm:ss"').addText((text2) => text2.setPlaceholder(plugin.settings.commitDateFormat).setValue(plugin.settings.commitDateFormat).onChange(async (value) => {
        plugin.settings.commitDateFormat = value;
        await plugin.saveSettings();
      }));
      new import_obsidian7.Setting(containerEl).setName("{{hostname}} placeholder replacement").setDesc("Specify custom hostname for every device.").addText((text2) => {
        var _a2;
        return text2.setValue((_a2 = plugin.localStorage.getHostname()) != null ? _a2 : "").onChange(async (value) => {
          plugin.localStorage.setHostname(value);
        });
      });
      new import_obsidian7.Setting(containerEl).setName("Preview commit message").addButton((button) => button.setButtonText("Preview").onClick(async () => {
        const commitMessagePreview = await plugin.gitManager.formatCommitMessage(plugin.settings.commitMessage);
        new import_obsidian7.Notice(`${commitMessagePreview}`);
      }));
      new import_obsidian7.Setting(containerEl).setName("List filenames affected by commit in the commit body").addToggle((toggle) => toggle.setValue(plugin.settings.listChangedFilesInMessageBody).onChange((value) => {
        plugin.settings.listChangedFilesInMessageBody = value;
        plugin.saveSettings();
      }));
      containerEl.createEl("br");
      containerEl.createEl("h3", { text: "Backup" });
      if (plugin.gitManager instanceof SimpleGit)
        new import_obsidian7.Setting(containerEl).setName("Sync Method").setDesc("Selects the method used for handling new changes found in your remote git repository.").addDropdown((dropdown) => {
          const options = {
            "merge": "Merge",
            "rebase": "Rebase",
            "reset": "Other sync service (Only updates the HEAD without touching the working directory)"
          };
          dropdown.addOptions(options);
          dropdown.setValue(plugin.settings.syncMethod);
          dropdown.onChange(async (option) => {
            plugin.settings.syncMethod = option;
            plugin.saveSettings();
          });
        });
      new import_obsidian7.Setting(containerEl).setName("Pull updates on startup").setDesc("Automatically pull updates when Obsidian starts").addToggle((toggle) => toggle.setValue(plugin.settings.autoPullOnBoot).onChange((value) => {
        plugin.settings.autoPullOnBoot = value;
        plugin.saveSettings();
      }));
      new import_obsidian7.Setting(containerEl).setName("Push on backup").setDesc("Disable to only commit changes").addToggle((toggle) => toggle.setValue(!plugin.settings.disablePush).onChange((value) => {
        plugin.settings.disablePush = !value;
        plugin.saveSettings();
      }));
      new import_obsidian7.Setting(containerEl).setName("Pull changes before push").setDesc("Commit -> pull -> push (Only if pushing is enabled)").addToggle((toggle) => toggle.setValue(plugin.settings.pullBeforePush).onChange((value) => {
        plugin.settings.pullBeforePush = value;
        plugin.saveSettings();
      }));
    }
    containerEl.createEl("br");
    containerEl.createEl("h3", { text: "Miscellaneous" });
    new import_obsidian7.Setting(containerEl).setName("Automatically refresh Source Control View on file changes").setDesc("On slower machines this may cause lags. If so, just disable this option").addToggle((toggle) => toggle.setValue(plugin.settings.refreshSourceControl).onChange((value) => {
      plugin.settings.refreshSourceControl = value;
      plugin.saveSettings();
    }));
    new import_obsidian7.Setting(containerEl).setName("Source Control View refresh interval").setDesc("Milliseconds to wait after file change before refreshing the Source Control View").addText((toggle) => toggle.setValue(plugin.settings.refreshSourceControlTimer.toString()).setPlaceholder("7000").onChange((value) => {
      plugin.settings.refreshSourceControlTimer = Math.max(parseInt(value), 500);
      plugin.saveSettings();
      plugin.setRefreshDebouncer();
    }));
    new import_obsidian7.Setting(containerEl).setName("Disable notifications").setDesc("Disable notifications for git operations to minimize distraction (refer to status bar for updates). Errors are still shown as notifications even if you enable this setting").addToggle((toggle) => toggle.setValue(plugin.settings.disablePopups).onChange((value) => {
      plugin.settings.disablePopups = value;
      plugin.saveSettings();
    }));
    new import_obsidian7.Setting(containerEl).setName("Show status bar").setDesc("Obsidian must be restarted for the changes to take affect").addToggle((toggle) => toggle.setValue(plugin.settings.showStatusBar).onChange((value) => {
      plugin.settings.showStatusBar = value;
      plugin.saveSettings();
    }));
    new import_obsidian7.Setting(containerEl).setName("Show branch status bar").setDesc("Obsidian must be restarted for the changes to take affect").addToggle((toggle) => toggle.setValue(plugin.settings.showBranchStatusBar).onChange((value) => {
      plugin.settings.showBranchStatusBar = value;
      plugin.saveSettings();
    }));
    new import_obsidian7.Setting(containerEl).setName("Show changes files count in status bar").addToggle((toggle) => toggle.setValue(plugin.settings.changedFilesInStatusBar).onChange((value) => {
      plugin.settings.changedFilesInStatusBar = value;
      plugin.saveSettings();
    }));
    containerEl.createEl("br");
    if (plugin.gitManager instanceof IsomorphicGit) {
      containerEl.createEl("h3", { text: "Authentication/Commit Author" });
    } else {
      containerEl.createEl("h3", { text: "Commit Author" });
    }
    if (plugin.gitManager instanceof IsomorphicGit)
      new import_obsidian7.Setting(containerEl).setName("Username on your git server. E.g. your username on GitHub").addText((cb) => {
        var _a2;
        cb.setValue((_a2 = plugin.localStorage.getUsername()) != null ? _a2 : "");
        cb.onChange((value) => {
          plugin.localStorage.setUsername(value);
        });
      });
    if (plugin.gitManager instanceof IsomorphicGit)
      new import_obsidian7.Setting(containerEl).setName("Password/Personal access token").setDesc("Type in your password. You won't be able to see it again.").addText((cb) => {
        cb.inputEl.autocapitalize = "off";
        cb.inputEl.autocomplete = "off";
        cb.inputEl.spellcheck = false;
        cb.onChange((value) => {
          plugin.localStorage.setPassword(value);
        });
      });
    if (gitReady)
      new import_obsidian7.Setting(containerEl).setName("Author name for commit").addText(async (cb) => {
        cb.setValue(await plugin.gitManager.getConfig("user.name"));
        cb.onChange((value) => {
          plugin.gitManager.setConfig("user.name", value == "" ? void 0 : value);
        });
      });
    if (gitReady)
      new import_obsidian7.Setting(containerEl).setName("Author email for commit").addText(async (cb) => {
        cb.setValue(await plugin.gitManager.getConfig("user.email"));
        cb.onChange((value) => {
          plugin.gitManager.setConfig("user.email", value == "" ? void 0 : value);
        });
      });
    containerEl.createEl("br");
    containerEl.createEl("h3", { text: "Advanced" });
    if (plugin.gitManager instanceof SimpleGit)
      new import_obsidian7.Setting(containerEl).setName("Update submodules").setDesc('"Create backup" and "pull" takes care of submodules. Missing features: Conflicted files, count of pulled/pushed/committed files. Tracking branch needs to be set for each submodule').addToggle((toggle) => toggle.setValue(plugin.settings.updateSubmodules).onChange((value) => {
        plugin.settings.updateSubmodules = value;
        plugin.saveSettings();
      }));
    if (plugin.gitManager instanceof SimpleGit)
      new import_obsidian7.Setting(containerEl).setName("Custom Git binary path").addText((cb) => {
        var _a2;
        cb.setValue((_a2 = plugin.localStorage.getGitPath()) != null ? _a2 : "");
        cb.setPlaceholder("git");
        cb.onChange((value) => {
          plugin.localStorage.setGitPath(value);
          plugin.gitManager.updateGitPath(value || "git");
        });
      });
    if (plugin.gitManager instanceof SimpleGit)
      new import_obsidian7.Setting(containerEl).setName("Additional PATH environment variable paths").setDesc("Use each line for one path").addTextArea((cb) => {
        cb.setValue(plugin.localStorage.getPATHPaths().join("\n"));
        cb.onChange((value) => {
          plugin.localStorage.setPATHPaths(value.split("\n"));
        });
      });
    if (plugin.gitManager instanceof SimpleGit)
      new import_obsidian7.Setting(containerEl).setName("Reload with new PATH environment variable").addButton((cb) => {
        cb.setButtonText("Reload");
        cb.setCta();
        cb.onClick(() => {
          plugin.gitManager.setGitInstance();
        });
      });
    new import_obsidian7.Setting(containerEl).setName("Custom base path (Git repository path)").setDesc(`
            Sets the relative path to the vault from which the Git binary should be executed.
             Mostly used to set the path to the Git repository, which is only required if the Git repository is below the vault root directory. Use "\\" instead of "/" on Windows.
            `).addText((cb) => {
      cb.setValue(plugin.settings.basePath);
      cb.setPlaceholder("directory/directory-with-git-repo");
      cb.onChange((value) => {
        plugin.settings.basePath = value;
        plugin.saveSettings();
        plugin.gitManager.updateBasePath(value || "");
      });
    });
    new import_obsidian7.Setting(containerEl).setName("Disable on this device").addToggle((toggle) => toggle.setValue(plugin.localStorage.getPluginDisabled()).onChange((value) => {
      plugin.localStorage.setPluginDisabled(value);
      if (value) {
        plugin.unloadPlugin();
      } else {
        plugin.loadPlugin();
      new import_obsidian7.Notice("Obsidian must be restarted for the changes to take affect");
    }));
    new import_obsidian7.Setting(containerEl).setName("Donate").setDesc("If you like this Plugin, consider donating to support continued development.").addButton((bt) => {
      bt.buttonEl.outerHTML = "<a href='https://ko-fi.com/F1F195IQ5' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>";
    });
    const info = containerEl.createDiv();
    info.setAttr("align", "center");
    info.setText("Debugging and logging:\nYou can always see the logs of this and every other plugin by opening the console with");
    const keys = containerEl.createDiv();
    keys.setAttr("align", "center");
    keys.addClass("obsidian-git-shortcuts");
    if (import_obsidian7.Platform.isMacOS === true) {
      keys.createEl("kbd", { text: "CMD (\u2318) + OPTION (\u2325) + I" });
    } else {
      keys.createEl("kbd", { text: "CTRL + SHIFT + I" });
    }
  }
};

// src/statusBar.ts
init_polyfill_buffer();
var import_obsidian8 = __toModule(require("obsidian"));
var StatusBar = class {
  constructor(statusBarEl, plugin) {
    this.statusBarEl = statusBarEl;
    this.plugin = plugin;
    this.messages = [];
    this.base = "obsidian-git-statusbar-";
    this.statusBarEl.setAttribute("aria-label-position", "top");
  }
  displayMessage(message, timeout) {
    this.messages.push({
      message: `Git: ${message.slice(0, 100)}`,
      timeout
    });
    this.display();
  }
  display() {
    if (this.messages.length > 0 && !this.currentMessage) {
      this.currentMessage = this.messages.shift();
      this.statusBarEl.addClass(this.base + "message");
      this.statusBarEl.ariaLabel = "";
      this.statusBarEl.setText(this.currentMessage.message);
      this.lastMessageTimestamp = Date.now();
    } else if (this.currentMessage) {
      const messageAge = Date.now() - this.lastMessageTimestamp;
      if (messageAge >= this.currentMessage.timeout) {
        this.currentMessage = null;
        this.lastMessageTimestamp = null;
      }
    } else {
      this.displayState();
  }
  displayState() {
    if (this.statusBarEl.getText().length > 3 || !this.statusBarEl.hasChildNodes()) {
      this.statusBarEl.empty();
      this.iconEl = this.statusBarEl.createDiv();
      this.textEl = this.statusBarEl.createDiv();
      this.textEl.style.float = "right";
      this.textEl.style.marginLeft = "5px";
      this.iconEl.style.float = "left";
    }
    switch (this.plugin.state) {
      case PluginState.idle:
        this.displayFromNow(this.plugin.lastUpdate);
        break;
      case PluginState.status:
        this.statusBarEl.ariaLabel = "Checking repository status...";
        (0, import_obsidian8.setIcon)(this.iconEl, "refresh-cw");
        this.statusBarEl.addClass(this.base + "status");
        break;
      case PluginState.add:
        this.statusBarEl.ariaLabel = "Adding files...";
        (0, import_obsidian8.setIcon)(this.iconEl, "refresh-w");
        this.statusBarEl.addClass(this.base + "add");
        break;
      case PluginState.commit:
        this.statusBarEl.ariaLabel = "Committing changes...";
        (0, import_obsidian8.setIcon)(this.iconEl, "git-commit");
        this.statusBarEl.addClass(this.base + "commit");
        break;
      case PluginState.push:
        this.statusBarEl.ariaLabel = "Pushing changes...";
        (0, import_obsidian8.setIcon)(this.iconEl, "upload");
        this.statusBarEl.addClass(this.base + "push");
        break;
      case PluginState.pull:
        this.statusBarEl.ariaLabel = "Pulling changes...";
        (0, import_obsidian8.setIcon)(this.iconEl, "download");
        this.statusBarEl.addClass(this.base + "pull");
        break;
      case PluginState.conflicted:
        this.statusBarEl.ariaLabel = "You have conflict files...";
        (0, import_obsidian8.setIcon)(this.iconEl, "alert-circle");
        this.statusBarEl.addClass(this.base + "conflict");
        break;
      default:
        this.statusBarEl.ariaLabel = "Failed on initialization!";
        (0, import_obsidian8.setIcon)(this.iconEl, "alert-triangle");
        this.statusBarEl.addClass(this.base + "failed-init");
        break;
    }
  }
  displayFromNow(timestamp) {
    if (timestamp) {
      const moment = window.moment;
      const fromNow = moment(timestamp).fromNow();
      this.statusBarEl.ariaLabel = `${this.plugin.offlineMode ? "Offline: " : ""}Last Git update: ${fromNow}`;
      this.statusBarEl.ariaLabel = this.plugin.offlineMode ? "Git is offline" : "Git is ready";
    if (this.plugin.offlineMode) {
      (0, import_obsidian8.setIcon)(this.iconEl, "globe");
      (0, import_obsidian8.setIcon)(this.iconEl, "check");
    if (this.plugin.settings.changedFilesInStatusBar && this.plugin.cachedStatus) {
      this.textEl.setText(this.plugin.cachedStatus.changed.length.toString());
    this.statusBarEl.addClass(this.base + "idle");
  }
};

// src/ui/modals/changedFilesModal.ts
init_polyfill_buffer();
var import_obsidian9 = __toModule(require("obsidian"));
var ChangedFilesModal = class extends import_obsidian9.FuzzySuggestModal {
  constructor(plugin, changedFiles) {
    super(plugin.app);
    this.plugin = plugin;
    this.changedFiles = changedFiles;
    this.setPlaceholder("Not supported files will be opened by default app!");
  }
  getItems() {
    return this.changedFiles;
  }
  getItemText(item) {
    if (item.index == "U" && item.working_dir == "U") {
      return `Untracked | ${item.vault_path}`;
    let working_dir = "";
    let index2 = "";
    if (item.working_dir != " ")
      working_dir = `Working dir: ${item.working_dir} `;
    if (item.index != " ")
      index2 = `Index: ${item.index}`;
    return `${working_dir}${index2} | ${item.vault_path}`;
  }
  onChooseItem(item, _) {
    if (this.plugin.app.metadataCache.getFirstLinkpathDest(item.vault_path, "") == null) {
      this.app.openWithDefaultApp(item.vault_path);
      this.plugin.app.workspace.openLinkText(item.vault_path, "/");
  }
};

// src/ui/modals/customMessageModal.ts
init_polyfill_buffer();
var import_obsidian10 = __toModule(require("obsidian"));
var CustomMessageModal = class extends import_obsidian10.SuggestModal {
  constructor(plugin, fromAutoBackup) {
    super(plugin.app);
    this.fromAutoBackup = fromAutoBackup;
    this.resolve = null;
    this.plugin = plugin;
    this.setPlaceholder("Type your message and select optional the version with the added date.");
  }
  open() {
    super.open();
    return new Promise((resolve) => {
      this.resolve = resolve;
    });
  }
  onClose() {
    if (this.resolve)
      this.resolve(void 0);
  }
  selectSuggestion(value, evt) {
    if (this.resolve)
      this.resolve(value);
    super.selectSuggestion(value, evt);
  }
  getSuggestions(query) {
    const date = window.moment().format(this.plugin.settings.commitDateFormat);
    if (query == "")
      query = "...";
    return [query, `${date}: ${query}`, `${query}: ${date}`];
  }
  renderSuggestion(value, el) {
    el.innerText = value;
  }
  onChooseSuggestion(item, _) {
  }
};

// src/constants.ts
init_polyfill_buffer();
var import_obsidian11 = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  commitMessage: "vault backup: {{date}}",
  autoCommitMessage: void 0,
  commitDateFormat: "YYYY-MM-DD HH:mm:ss",
  autoSaveInterval: 0,
  autoPushInterval: 0,
  autoPullInterval: 0,
  autoPullOnBoot: false,
  disablePush: false,
  pullBeforePush: true,
  disablePopups: false,
  listChangedFilesInMessageBody: false,
  showStatusBar: true,
  updateSubmodules: false,
  syncMethod: "merge",
  customMessageOnAutoBackup: false,
  autoBackupAfterFileChange: false,
  treeStructure: false,
  refreshSourceControl: import_obsidian11.Platform.isDesktopApp,
  basePath: "",
  differentIntervalCommitAndPush: false,
  changedFilesInStatusBar: false,
  showedMobileNotice: false,
  refreshSourceControlTimer: 7e3,
  showBranchStatusBar: true,
  setLastSaveToLastCommit: false
};
var GIT_VIEW_CONFIG = {
  type: "git-view",
  name: "Source Control",
  icon: "git-pull-request"
};
var DIFF_VIEW_CONFIG = {
  type: "diff-view",
  name: "Diff View",
  icon: "git-pull-request"
};

// src/localStorageSettings.ts
init_polyfill_buffer();
var LocalStorageSettings = class {
  constructor(plugin) {
    this.plugin = plugin;
    this.prefix = this.plugin.manifest.id + ":";
  }
  migrate() {
    const keys = ["password", "hostname", "conflict", "lastAutoPull", "lastAutoBackup", "lastAutoPush", "gitPath", "pluginDisabled"];
    for (const key2 of keys) {
      const old = localStorage.getItem(this.prefix + key2);
      if (app.loadLocalStorage(this.prefix + key2) == null && old != null) {
        if (old != null) {
          app.saveLocalStorage(this.prefix + key2, old);
          localStorage.removeItem(this.prefix + key2);
        }
  }
  getPassword() {
    return app.loadLocalStorage(this.prefix + "password");
  }
  setPassword(value) {
    return app.saveLocalStorage(this.prefix + "password", value);
  }
  getUsername() {
    return app.loadLocalStorage(this.prefix + "username");
  }
  setUsername(value) {
    return app.saveLocalStorage(this.prefix + "username", value);
  }
  getHostname() {
    return app.loadLocalStorage(this.prefix + "hostname");
  }
  setHostname(value) {
    return app.saveLocalStorage(this.prefix + "hostname", value);
  }
  getConflict() {
    return app.loadLocalStorage(this.prefix + "conflict");
  }
  setConflict(value) {
    return app.saveLocalStorage(this.prefix + "conflict", value);
  }
  getLastAutoPull() {
    return app.loadLocalStorage(this.prefix + "lastAutoPull");
  }
  setLastAutoPull(value) {
    return app.saveLocalStorage(this.prefix + "lastAutoPull", value);
  }
  getLastAutoBackup() {
    return app.loadLocalStorage(this.prefix + "lastAutoBackup");
  }
  setLastAutoBackup(value) {
    return app.saveLocalStorage(this.prefix + "lastAutoBackup", value);
  }
  getLastAutoPush() {
    return app.loadLocalStorage(this.prefix + "lastAutoPush");
  }
  setLastAutoPush(value) {
    return app.saveLocalStorage(this.prefix + "lastAutoPush", value);
  }
  getGitPath() {
    return app.loadLocalStorage(this.prefix + "gitPath");
  }
  setGitPath(value) {
    return app.saveLocalStorage(this.prefix + "gitPath", value);
  }
  getPATHPaths() {
    var _a2, _b;
    return (_b = (_a2 = app.loadLocalStorage(this.prefix + "PATHPaths")) == null ? void 0 : _a2.split(":")) != null ? _b : [];
  }
  setPATHPaths(value) {
    return app.saveLocalStorage(this.prefix + "PATHPaths", value.join(":"));
  }
  getPluginDisabled() {
    return app.loadLocalStorage(this.prefix + "pluginDisabled") == "true";
  }
  setPluginDisabled(value) {
    return app.saveLocalStorage(this.prefix + "pluginDisabled", `${value}`);

// src/openInGitHub.ts
init_polyfill_buffer();
var import_obsidian12 = __toModule(require("obsidian"));
async function openLineInGitHub(editor, file, manager) {
  const { isGitHub, branch: branch2, repo, user } = await getData(manager);
  if (isGitHub) {
    const path2 = manager.getPath(file.path, true);
    const from = editor.getCursor("from").line + 1;
    const to = editor.getCursor("to").line + 1;
    if (from === to) {
      window.open(`https://github.com/${user}/${repo}/blob/${branch2}/${path2}?plain=1#L${from}`);
      window.open(`https://github.com/${user}/${repo}/blob/${branch2}/${path2}?plain=1#L${from}-L${to}`);
  } else {
    new import_obsidian12.Notice("It seems like you are not using GitHub");
}
async function openHistoryInGitHub(file, manager) {
  const { isGitHub, branch: branch2, repo, user } = await getData(manager);
  const path2 = manager.getPath(file.path, true);
  if (isGitHub) {
    window.open(`https://github.com/${user}/${repo}/commits/${branch2}/${path2}`);
  } else {
    new import_obsidian12.Notice("It seems like you are not using GitHub");
async function getData(manager) {
  const branchInfo = await manager.branchInfo();
  const remoteBranch = branchInfo.tracking;
  const branch2 = branchInfo.current;
  const remote = remoteBranch.substring(0, remoteBranch.indexOf("/"));
  const remoteUrl = await manager.getConfig(`remote.${remote}.url`);
  const [isGitHub, httpsUser, httpsRepo, sshUser, sshRepo] = remoteUrl.match(/(?:^https:\/\/github\.com\/(.*)\/(.*)\.git$)|(?:^git@github\.com:(.*)\/(.*)\.git$)/);
    isGitHub: !!isGitHub,
    repo: httpsRepo || sshRepo,
    user: httpsUser || sshUser,
    branch: branch2

// src/ui/diff/diffView.ts
init_polyfill_buffer();

// node_modules/diff2html/lib-esm/diff2html.js
init_polyfill_buffer();

// node_modules/diff2html/lib-esm/diff-parser.js
init_polyfill_buffer();

// node_modules/diff2html/lib-esm/types.js
init_polyfill_buffer();
var LineType;
(function(LineType2) {
  LineType2["INSERT"] = "insert";
  LineType2["DELETE"] = "delete";
  LineType2["CONTEXT"] = "context";
})(LineType || (LineType = {}));
var OutputFormatType = {
  LINE_BY_LINE: "line-by-line",
  SIDE_BY_SIDE: "side-by-side"
};
var LineMatchingType = {
  LINES: "lines",
  WORDS: "words",
  NONE: "none"
};
var DiffStyleType = {
  WORD: "word",
  CHAR: "char"
};

// node_modules/diff2html/lib-esm/utils.js
init_polyfill_buffer();
var specials = [
  "-",
  "[",
  "]",
  "/",
  "{",
  "}",
  "(",
  ")",
  "*",
  "+",
  "?",
  ".",
  "\\",
  "^",
  "$",
  "|"
];
var regex = RegExp("[" + specials.join("\\") + "]", "g");
function escapeForRegExp(str) {
  return str.replace(regex, "\\$&");
function unifyPath(path2) {
  return path2 ? path2.replace(/\\/g, "/") : path2;
}
function hashCode(text2) {
  var i, chr, len;
  var hash2 = 0;
  for (i = 0, len = text2.length; i < len; i++) {
    chr = text2.charCodeAt(i);
    hash2 = (hash2 << 5) - hash2 + chr;
    hash2 |= 0;
  return hash2;
}

// node_modules/diff2html/lib-esm/diff-parser.js
var __spreadArray = function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
  return to.concat(ar || Array.prototype.slice.call(from));
function getExtension(filename, language) {
  var filenameParts = filename.split(".");
  return filenameParts.length > 1 ? filenameParts[filenameParts.length - 1] : language;
function startsWithAny(str, prefixes) {
  return prefixes.reduce(function(startsWith, prefix) {
    return startsWith || str.startsWith(prefix);
  }, false);
}
var baseDiffFilenamePrefixes = ["a/", "b/", "i/", "w/", "c/", "o/"];
function getFilename(line, linePrefix, extraPrefix) {
  var prefixes = extraPrefix !== void 0 ? __spreadArray(__spreadArray([], baseDiffFilenamePrefixes, true), [extraPrefix], false) : baseDiffFilenamePrefixes;
  var FilenameRegExp = linePrefix ? new RegExp("^".concat(escapeForRegExp(linePrefix), ' "?(.+?)"?$')) : new RegExp('^"?(.+?)"?$');
  var _a2 = FilenameRegExp.exec(line) || [], _b = _a2[1], filename = _b === void 0 ? "" : _b;
  var matchingPrefix = prefixes.find(function(p) {
    return filename.indexOf(p) === 0;
  });
  var fnameWithoutPrefix = matchingPrefix ? filename.slice(matchingPrefix.length) : filename;
  return fnameWithoutPrefix.replace(/\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? [+-]\d{4}.*$/, "");
}
function getSrcFilename(line, srcPrefix) {
  return getFilename(line, "---", srcPrefix);
}
function getDstFilename(line, dstPrefix) {
  return getFilename(line, "+++", dstPrefix);
}
function parse(diffInput, config) {
  if (config === void 0) {
    config = {};
  var files = [];
  var currentFile = null;
  var currentBlock = null;
  var oldLine = null;
  var oldLine2 = null;
  var newLine = null;
  var possibleOldName = null;
  var possibleNewName = null;
  var oldFileNameHeader = "--- ";
  var newFileNameHeader = "+++ ";
  var hunkHeaderPrefix = "@@";
  var oldMode = /^old mode (\d{6})/;
  var newMode = /^new mode (\d{6})/;
  var deletedFileMode = /^deleted file mode (\d{6})/;
  var newFileMode = /^new file mode (\d{6})/;
  var copyFrom = /^copy from "?(.+)"?/;
  var copyTo = /^copy to "?(.+)"?/;
  var renameFrom = /^rename from "?(.+)"?/;
  var renameTo = /^rename to "?(.+)"?/;
  var similarityIndex = /^similarity index (\d+)%/;
  var dissimilarityIndex = /^dissimilarity index (\d+)%/;
  var index2 = /^index ([\da-z]+)\.\.([\da-z]+)\s*(\d{6})?/;
  var binaryFiles = /^Binary files (.*) and (.*) differ/;
  var binaryDiff = /^GIT binary patch/;
  var combinedIndex = /^index ([\da-z]+),([\da-z]+)\.\.([\da-z]+)/;
  var combinedMode = /^mode (\d{6}),(\d{6})\.\.(\d{6})/;
  var combinedNewFile = /^new file mode (\d{6})/;
  var combinedDeletedFile = /^deleted file mode (\d{6}),(\d{6})/;
  var diffLines2 = diffInput.replace(/\\ No newline at end of file/g, "").replace(/\r\n?/g, "\n").split("\n");
  function saveBlock() {
    if (currentBlock !== null && currentFile !== null) {
      currentFile.blocks.push(currentBlock);
      currentBlock = null;
    }
  }
  function saveFile() {
    if (currentFile !== null) {
      if (!currentFile.oldName && possibleOldName !== null) {
        currentFile.oldName = possibleOldName;
      }
      if (!currentFile.newName && possibleNewName !== null) {
        currentFile.newName = possibleNewName;
      }
      if (currentFile.newName) {
        files.push(currentFile);
        currentFile = null;
      }
    }
    possibleOldName = null;
    possibleNewName = null;
  }
  function startFile() {
    saveBlock();
    saveFile();
    currentFile = {
      blocks: [],
      deletedLines: 0,
      addedLines: 0
    };
  }
  function startBlock(line) {
    saveBlock();
    var values;
    if (currentFile !== null) {
      if (values = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@.*/.exec(line)) {
        currentFile.isCombined = false;
        oldLine = parseInt(values[1], 10);
        newLine = parseInt(values[2], 10);
      } else if (values = /^@@@ -(\d+)(?:,\d+)? -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@@.*/.exec(line)) {
        currentFile.isCombined = true;
        oldLine = parseInt(values[1], 10);
        oldLine2 = parseInt(values[2], 10);
        newLine = parseInt(values[3], 10);
      } else {
        if (line.startsWith(hunkHeaderPrefix)) {
          console.error("Failed to parse lines, starting in 0!");
        }
        oldLine = 0;
        newLine = 0;
        currentFile.isCombined = false;
    currentBlock = {
      lines: [],
      oldStartLine: oldLine,
      oldStartLine2: oldLine2,
      newStartLine: newLine,
      header: line
  function createLine(line) {
    if (currentFile === null || currentBlock === null || oldLine === null || newLine === null)
      return;
    var currentLine = {
      content: line
    };
    var addedPrefixes = currentFile.isCombined ? ["+ ", " +", "++"] : ["+"];
    var deletedPrefixes = currentFile.isCombined ? ["- ", " -", "--"] : ["-"];
    if (startsWithAny(line, addedPrefixes)) {
      currentFile.addedLines++;
      currentLine.type = LineType.INSERT;
      currentLine.oldNumber = void 0;
      currentLine.newNumber = newLine++;
    } else if (startsWithAny(line, deletedPrefixes)) {
      currentFile.deletedLines++;
      currentLine.type = LineType.DELETE;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = void 0;
    } else {
      currentLine.type = LineType.CONTEXT;
      currentLine.oldNumber = oldLine++;
      currentLine.newNumber = newLine++;
    currentBlock.lines.push(currentLine);
  function existHunkHeader(line, lineIdx) {
    var idx = lineIdx;
    while (idx < diffLines2.length - 3) {
      if (line.startsWith("diff")) {
        return false;
      }
      if (diffLines2[idx].startsWith(oldFileNameHeader) && diffLines2[idx + 1].startsWith(newFileNameHeader) && diffLines2[idx + 2].startsWith(hunkHeaderPrefix)) {
        return true;
      }
      idx++;
    return false;
  diffLines2.forEach(function(line, lineIndex) {
    if (!line || line.startsWith("*")) {
      return;
    }
    var values;
    var prevLine = diffLines2[lineIndex - 1];
    var nxtLine = diffLines2[lineIndex + 1];
    var afterNxtLine = diffLines2[lineIndex + 2];
    if (line.startsWith("diff")) {
      startFile();
      var gitDiffStart = /^diff --git "?([a-ciow]\/.+)"? "?([a-ciow]\/.+)"?/;
      if (values = gitDiffStart.exec(line)) {
        possibleOldName = getFilename(values[1], void 0, config.dstPrefix);
        possibleNewName = getFilename(values[2], void 0, config.srcPrefix);
      }
      if (currentFile === null) {
        throw new Error("Where is my file !!!");
      currentFile.isGitDiff = true;
      return;
    if (!currentFile || !currentFile.isGitDiff && currentFile && line.startsWith(oldFileNameHeader) && nxtLine.startsWith(newFileNameHeader) && afterNxtLine.startsWith(hunkHeaderPrefix)) {
      startFile();
    if (currentFile === null || currentFile === void 0 ? void 0 : currentFile.isTooBig) {
      return;
    }
    if (currentFile && (typeof config.diffMaxChanges === "number" && currentFile.addedLines + currentFile.deletedLines > config.diffMaxChanges || typeof config.diffMaxLineLength === "number" && line.length > config.diffMaxLineLength)) {
      currentFile.isTooBig = true;
      currentFile.addedLines = 0;
      currentFile.deletedLines = 0;
      currentFile.blocks = [];
      currentBlock = null;
      var message = typeof config.diffTooBigMessage === "function" ? config.diffTooBigMessage(files.length) : "Diff too big to be displayed";
      startBlock(message);
      return;
    }
    if (line.startsWith(oldFileNameHeader) && nxtLine.startsWith(newFileNameHeader) || line.startsWith(newFileNameHeader) && prevLine.startsWith(oldFileNameHeader)) {
      if (currentFile && !currentFile.oldName && line.startsWith("--- ") && (values = getSrcFilename(line, config.srcPrefix))) {
        currentFile.oldName = values;
        currentFile.language = getExtension(currentFile.oldName, currentFile.language);
        return;
      }
      if (currentFile && !currentFile.newName && line.startsWith("+++ ") && (values = getDstFilename(line, config.dstPrefix))) {
        currentFile.newName = values;
        currentFile.language = getExtension(currentFile.newName, currentFile.language);
        return;
      }
    }
    if (currentFile && (line.startsWith(hunkHeaderPrefix) || currentFile.isGitDiff && currentFile.oldName && currentFile.newName && !currentBlock)) {
      startBlock(line);
      return;
    }
    if (currentBlock && (line.startsWith("+") || line.startsWith("-") || line.startsWith(" "))) {
      createLine(line);
      return;
    }
    var doesNotExistHunkHeader = !existHunkHeader(line, lineIndex);
    if (currentFile === null) {
      throw new Error("Where is my file !!!");
    }
    if (values = oldMode.exec(line)) {
      currentFile.oldMode = values[1];
    } else if (values = newMode.exec(line)) {
      currentFile.newMode = values[1];
    } else if (values = deletedFileMode.exec(line)) {
      currentFile.deletedFileMode = values[1];
      currentFile.isDeleted = true;
    } else if (values = newFileMode.exec(line)) {
      currentFile.newFileMode = values[1];
      currentFile.isNew = true;
    } else if (values = copyFrom.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.oldName = values[1];
      }
      currentFile.isCopy = true;
    } else if (values = copyTo.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.newName = values[1];
      }
      currentFile.isCopy = true;
    } else if (values = renameFrom.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.oldName = values[1];
      }
      currentFile.isRename = true;
    } else if (values = renameTo.exec(line)) {
      if (doesNotExistHunkHeader) {
        currentFile.newName = values[1];
      }
      currentFile.isRename = true;
    } else if (values = binaryFiles.exec(line)) {
      currentFile.isBinary = true;
      currentFile.oldName = getFilename(values[1], void 0, config.srcPrefix);
      currentFile.newName = getFilename(values[2], void 0, config.dstPrefix);
      startBlock("Binary file");
    } else if (binaryDiff.test(line)) {
      currentFile.isBinary = true;
      startBlock(line);
    } else if (values = similarityIndex.exec(line)) {
      currentFile.unchangedPercentage = parseInt(values[1], 10);
    } else if (values = dissimilarityIndex.exec(line)) {
      currentFile.changedPercentage = parseInt(values[1], 10);
    } else if (values = index2.exec(line)) {
      currentFile.checksumBefore = values[1];
      currentFile.checksumAfter = values[2];
      values[3] && (currentFile.mode = values[3]);
    } else if (values = combinedIndex.exec(line)) {
      currentFile.checksumBefore = [values[2], values[3]];
      currentFile.checksumAfter = values[1];
    } else if (values = combinedMode.exec(line)) {
      currentFile.oldMode = [values[2], values[3]];
      currentFile.newMode = values[1];
    } else if (values = combinedNewFile.exec(line)) {
      currentFile.newFileMode = values[1];
      currentFile.isNew = true;
    } else if (values = combinedDeletedFile.exec(line)) {
      currentFile.deletedFileMode = values[1];
      currentFile.isDeleted = true;
    }
  });
  saveBlock();
  saveFile();
  return files;
}

// node_modules/diff2html/lib-esm/file-list-renderer.js
init_polyfill_buffer();

// node_modules/diff2html/lib-esm/render-utils.js
init_polyfill_buffer();
var import_obsidian13 = __toModule(require("obsidian"));
var DiffView = class extends import_obsidian13.ItemView {
    this.navigation = true;
  async setState(state, result) {
    this.state = state;
    await this.refresh();
    return;
  async refresh() {
    var _a2;
    if (((_a2 = this.state) == null ? void 0 : _a2.file) && !this.gettingDiff && this.plugin.gitManager) {
      this.gettingDiff = true;
      let diff2 = await this.plugin.gitManager.getDiffString(this.state.file, this.state.staged);
      this.contentEl.empty();
      if (!diff2) {
        const content = await this.app.vault.adapter.read(this.plugin.gitManager.getVaultPath(this.state.file));
        const header = `--- /dev/null
        diff2 = [...header.split("\n"), ...content.split("\n").map((line) => `+${line}`)].join("\n");
      const diffEl = this.parser.parseFromString(html(diff2), "text/html").querySelector(".d2h-file-diff");
      this.contentEl.append(diffEl);
      this.gettingDiff = false;
    }
// src/ui/modals/branchModal.ts
var import_obsidian14 = __toModule(require("obsidian"));
var BranchModal = class extends import_obsidian14.FuzzySuggestModal {
  constructor(branches) {
    super(app);
    this.branches = branches;
    this.setPlaceholder("Select branch to checkout");
  }
  getItems() {
    return this.branches;
  }
  getItemText(item) {
    return item;
  }
  onChooseItem(item, evt) {
    this.resolve(item);
  async onClose() {
    await new Promise((resolve) => setTimeout(resolve, 10));
var import_obsidian15 = __toModule(require("obsidian"));
var IgnoreModal = class extends import_obsidian15.Modal {
    const { contentEl, titleEl } = this;
    }).addEventListener("click", async () => {
    });
    const { contentEl } = this;
var import_obsidian22 = __toModule(require("obsidian"));
function append_empty_stylesheet(node) {
  const style_element = element("style");
  append_stylesheet(get_root_for_style(node), style_element);
  return style_element.sheet;
}
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
function set_style(node, key2, value, important) {
  if (value === null) {
    node.style.removeProperty(key2);
  } else {
    node.style.setProperty(key2, value, important ? "important" : "");
  }
}
function create_style_information(doc, node) {
  const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
  const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
      const { ownerNode } = info.stylesheet;
      if (ownerNode)
        detach(ownerNode);
  "inert",
  "itemscope",
  const { fragment, after_update } = component.$$;
      const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
      if (component.$$.on_destroy) {
        component.$$.on_destroy.push(...new_on_destroy);
    ctx: [],
  let ready = false;
      if (ready)
  ready = true;
      if (!is_function(callback)) {
        return noop;
      }
    if (!is_function(callback)) {
      return noop;
    }
var import_obsidian21 = __toModule(require("obsidian"));
var import_obsidian16 = __toModule(require("obsidian"));
var DiscardModal = class extends import_obsidian16.Modal {
    const { contentEl, titleEl } = this;
    div.createEl("button", {
      text: "Cancel",
      attr: {
        style: "margin: 0 10px"
      }
    }).addEventListener("click", () => {
      text: "Confirm",
      attr: {
        style: "margin: 0 10px"
      }
    }).addEventListener("click", async () => {
    });
    const { contentEl } = this;
// src/ui/sidebar/components/fileComponent.svelte
init_polyfill_buffer();
var import_obsidian18 = __toModule(require("obsidian"));

// node_modules/obsidian-community-lib/dist/index.js
init_polyfill_buffer();

// node_modules/obsidian-community-lib/dist/utils.js
init_polyfill_buffer();
var feather = __toModule(require_feather());
var import_obsidian17 = __toModule(require("obsidian"));
function hoverPreview(event, view, to) {
  const targetEl = event.target;
  app.workspace.trigger("hover-link", {
    event,
    source: view.getViewType(),
    hoverParent: view,
    targetEl,
    linktext: to
  });
}

  append_styles(target, "svelte-wn85nz", "main.svelte-wn85nz .nav-file-title-content.svelte-wn85nz.svelte-wn85nz{display:flex;align-items:center}main.svelte-wn85nz .tools.svelte-wn85nz.svelte-wn85nz{display:flex;margin-left:auto}main.svelte-wn85nz .tools .type.svelte-wn85nz.svelte-wn85nz{padding-left:var(--size-2-1);width:11px;display:flex;align-items:center;justify-content:center}main.svelte-wn85nz .tools .type[data-type=M].svelte-wn85nz.svelte-wn85nz{color:orange}main.svelte-wn85nz .tools .type[data-type=D].svelte-wn85nz.svelte-wn85nz{color:red}main.svelte-wn85nz .tools .buttons.svelte-wn85nz.svelte-wn85nz{display:flex}main.svelte-wn85nz .tools .buttons.svelte-wn85nz>.svelte-wn85nz{padding:0 0;height:auto}");
      attr(div, "class", "clickable-icon svelte-wn85nz");
      ctx[11](div);
        dispose = [
          listen(div, "auxclick", ctx[5]),
          listen(div, "click", ctx[5])
        ];
      ctx[11](null);
      run_all(dispose);
  var _a2;
  let div6;
  let div0;
  let t0_value = ((_a2 = ctx[0].vault_path.split("/").last()) == null ? void 0 : _a2.replace(".md", "")) + "";
  let div5;
  let t3;
  let div2;
  let div4;
  let div4_data_type_value;
  let div6_aria_label_value;
      div6 = element("div");
      div0 = element("div");
      div5 = element("div");
      t3 = space();
      div2 = element("div");
      div4 = element("div");
      attr(div0, "class", "nav-file-title-content svelte-wn85nz");
      attr(div1, "data-icon", "undo");
      attr(div1, "aria-label", "Discard");
      attr(div1, "class", "clickable-icon svelte-wn85nz");
      attr(div2, "data-icon", "plus");
      attr(div2, "aria-label", "Stage");
      attr(div2, "class", "clickable-icon svelte-wn85nz");
      attr(div3, "class", "buttons svelte-wn85nz");
      attr(div4, "class", "type svelte-wn85nz");
      attr(div4, "data-type", div4_data_type_value = ctx[0].working_dir);
      attr(div5, "class", "tools svelte-wn85nz");
      attr(div6, "class", "nav-file-title");
      attr(div6, "aria-label-position", ctx[3]);
      attr(div6, "aria-label", div6_aria_label_value = ctx[0].vault_path.split("/").last() != ctx[0].vault_path ? ctx[0].vault_path : "");
      attr(main, "class", "nav-file svelte-wn85nz");
      append2(main, div6);
      append2(div6, div0);
      append2(div0, t0);
      append2(div6, t1);
      append2(div6, div5);
      append2(div5, div3);
        if_block.m(div3, null);
      append2(div3, t2);
      append2(div3, div1);
      ctx[12](div1);
      append2(div3, t3);
      append2(div3, div2);
      ctx[13](div2);
      append2(div5, t4);
      append2(div5, div4);
      append2(div4, t5);
          listen(div0, "click", ctx[7]),
          listen(div0, "auxclick", ctx[7]),
          listen(div1, "click", ctx[8]),
          listen(div2, "click", ctx[6]),
          listen(div6, "click", self2(ctx[7])),
          listen(div6, "auxclick", self2(ctx[7])),
          listen(main, "focus", ctx[10])
      var _a3;
      if (dirty & 1 && t0_value !== (t0_value = ((_a3 = ctx2[0].vault_path.split("/").last()) == null ? void 0 : _a3.replace(".md", "")) + ""))
          if_block.m(div3, t2);
      if (dirty & 1 && div4_data_type_value !== (div4_data_type_value = ctx2[0].working_dir)) {
        attr(div4, "data-type", div4_data_type_value);
      }
      if (dirty & 8) {
        attr(div6, "aria-label-position", ctx2[3]);
      }
      if (dirty & 1 && div6_aria_label_value !== (div6_aria_label_value = ctx2[0].vault_path.split("/").last() != ctx2[0].vault_path ? ctx2[0].vault_path : "")) {
        attr(div6, "aria-label", div6_aria_label_value);
      ctx[12](null);
  window.setTimeout(() => buttons.forEach((b) => (0, import_obsidian18.setIcon)(b, b.getAttr("data-icon"))), 0);
    var _a2;
    const file = view.app.vault.getAbstractFileByPath(change.vault_path);
    console.log(event);
    if (file instanceof import_obsidian18.TFile) {
      (_a2 = getNewLeaf(event)) === null || _a2 === void 0 ? void 0 : _a2.openFile(file);
    var _a2;
    (_a2 = getNewLeaf(event)) === null || _a2 === void 0 ? void 0 : _a2.setViewState({
      type: DIFF_VIEW_CONFIG.type,
      active: true,
      state: { file: change.path, staged: false }
    });
  function div1_binding($$value) {
  function div2_binding($$value) {
    div1_binding,
    div2_binding
    init2(this, options, instance, create_fragment, safe_not_equal, { change: 0, view: 1, manager: 9 }, add_css);
var import_obsidian19 = __toModule(require("obsidian"));
  append_styles(target, "svelte-sajhpp", "main.svelte-sajhpp .nav-file-title-content.svelte-sajhpp{display:flex;align-items:center}main.svelte-sajhpp .tools.svelte-sajhpp{display:flex;margin-left:auto}main.svelte-sajhpp .tools .type.svelte-sajhpp{padding-left:var(--size-2-1);display:flex;align-items:center;justify-content:center}main.svelte-sajhpp .tools .type[data-type=M].svelte-sajhpp{color:orange}main.svelte-sajhpp .tools .type[data-type=D].svelte-sajhpp{color:red}");
  var _a2;
  let div2;
  let div0;
  let t0_value = ((_a2 = ctx[0].vault_path.split("/").last()) == null ? void 0 : _a2.replace(".md", "")) + "";
  let div1;
  let span;
  let span_data_type_value;
  let div2_aria_label_value;
      div2 = element("div");
      div0 = element("div");
      div1 = element("div");
      span = element("span");
      attr(div0, "class", "nav-file-title-content svelte-sajhpp");
      attr(span, "class", "type svelte-sajhpp");
      attr(span, "data-type", span_data_type_value = ctx[0].working_dir);
      attr(div1, "class", "tools svelte-sajhpp");
      attr(div2, "class", "nav-file-title");
      attr(div2, "aria-label-position", ctx[1]);
      attr(div2, "aria-label", div2_aria_label_value = ctx[0].vault_path.split("/").last() != ctx[0].vault_path ? ctx[0].vault_path : "");
      attr(main, "class", "nav-file svelte-sajhpp");
      append2(main, div2);
      append2(div2, div0);
      append2(div0, t0);
      append2(div2, t1);
      append2(div2, div1);
      append2(div1, span);
      append2(span, t2);
          listen(main, "click", ctx[3]),
      var _a3;
      if (dirty & 1 && t0_value !== (t0_value = ((_a3 = ctx2[0].vault_path.split("/").last()) == null ? void 0 : _a3.replace(".md", "")) + ""))
      if (dirty & 1 && span_data_type_value !== (span_data_type_value = ctx2[0].working_dir)) {
        attr(span, "data-type", span_data_type_value);
      }
      if (dirty & 2) {
        attr(div2, "aria-label-position", ctx2[1]);
      }
      if (dirty & 1 && div2_aria_label_value !== (div2_aria_label_value = ctx2[0].vault_path.split("/").last() != ctx2[0].vault_path ? ctx2[0].vault_path : "")) {
        attr(div2, "aria-label", div2_aria_label_value);
    var _a2;
    const file = view.app.vault.getAbstractFileByPath(change.vault_path);
    if (file instanceof import_obsidian19.TFile) {
      (_a2 = getNewLeaf(event)) === null || _a2 === void 0 ? void 0 : _a2.openFile(file);
var import_obsidian20 = __toModule(require("obsidian"));
  append_styles(target, "svelte-wn85nz", "main.svelte-wn85nz .nav-file-title-content.svelte-wn85nz.svelte-wn85nz{display:flex;align-items:center}main.svelte-wn85nz .tools.svelte-wn85nz.svelte-wn85nz{display:flex;margin-left:auto}main.svelte-wn85nz .tools .type.svelte-wn85nz.svelte-wn85nz{padding-left:var(--size-2-1);width:11px;display:flex;align-items:center;justify-content:center}main.svelte-wn85nz .tools .type[data-type=M].svelte-wn85nz.svelte-wn85nz{color:orange}main.svelte-wn85nz .tools .type[data-type=D].svelte-wn85nz.svelte-wn85nz{color:red}main.svelte-wn85nz .tools .buttons.svelte-wn85nz.svelte-wn85nz{display:flex}main.svelte-wn85nz .tools .buttons.svelte-wn85nz>.svelte-wn85nz{padding:0 0;height:auto}");
      attr(div, "class", "clickable-icon svelte-wn85nz");
  var _a2;
  let div5;
  let div0;
  let t0_value = ((_a2 = ctx[3].split("/").last()) == null ? void 0 : _a2.replace(".md", "")) + "";
  let div4;
  let div1;
  let div3;
  let div3_data_type_value;
  let div5_aria_label_value;
      div5 = element("div");
      div0 = element("div");
      div4 = element("div");
      div1 = element("div");
      div3 = element("div");
      attr(div0, "class", "nav-file-title-content svelte-wn85nz");
      attr(div1, "data-icon", "minus");
      attr(div1, "aria-label", "Unstage");
      attr(div1, "class", "clickable-icon svelte-wn85nz");
      attr(div2, "class", "buttons svelte-wn85nz");
      attr(div3, "class", "type svelte-wn85nz");
      attr(div3, "data-type", div3_data_type_value = ctx[0].index);
      attr(div4, "class", "tools svelte-wn85nz");
      attr(div5, "class", "nav-file-title");
      attr(div5, "aria-label-position", ctx[4]);
      attr(div5, "aria-label", div5_aria_label_value = ctx[3].split("/").last() != ctx[3] ? ctx[3] : "");
      attr(main, "class", "nav-file svelte-wn85nz");
      append2(main, div5);
      append2(div5, div0);
      append2(div0, t0);
      append2(div5, t1);
      append2(div5, div4);
      append2(div4, div2);
        if_block.m(div2, null);
      append2(div2, t2);
      append2(div2, div1);
      ctx[12](div1);
      append2(div4, t3);
      append2(div4, div3);
      append2(div3, t4);
          listen(div0, "click", ctx[7]),
          listen(div0, "auxclick", ctx[7]),
          listen(div1, "click", ctx[8]),
          listen(div5, "click", self2(ctx[7])),
      var _a3;
      if (dirty & 8 && t0_value !== (t0_value = ((_a3 = ctx2[3].split("/").last()) == null ? void 0 : _a3.replace(".md", "")) + ""))
          if_block.m(div2, t2);
      if (dirty & 1 && div3_data_type_value !== (div3_data_type_value = ctx2[0].index)) {
        attr(div3, "data-type", div3_data_type_value);
      }
      if (dirty & 16) {
        attr(div5, "aria-label-position", ctx2[4]);
      }
      if (dirty & 8 && div5_aria_label_value !== (div5_aria_label_value = ctx2[3].split("/").last() != ctx2[3] ? ctx2[3] : "")) {
        attr(div5, "aria-label", div5_aria_label_value);
  window.setTimeout(() => buttons.forEach((b) => (0, import_obsidian20.setIcon)(b, b.getAttr("data-icon"), 16)), 0);
    var _a2;
    const file = view.app.vault.getAbstractFileByPath(change.vault_path);
    if (file instanceof import_obsidian20.TFile) {
      (_a2 = getNewLeaf(event)) === null || _a2 === void 0 ? void 0 : _a2.openFile(file);
    var _a2;
    (_a2 = getNewLeaf(event)) === null || _a2 === void 0 ? void 0 : _a2.setViewState({
      type: DIFF_VIEW_CONFIG.type,
      active: true,
      state: { file: change.path, staged: true }
    });
  function div1_binding($$value) {
    div1_binding
  append_styles(target, "svelte-148wteu", "main.svelte-148wteu .nav-folder-title-content.svelte-148wteu.svelte-148wteu{display:flex;align-items:center}main.svelte-148wteu .tools.svelte-148wteu.svelte-148wteu{display:flex;margin-left:auto}main.svelte-148wteu .tools .buttons.svelte-148wteu.svelte-148wteu{display:flex}main.svelte-148wteu .tools .buttons.svelte-148wteu>.svelte-148wteu{padding:0 0;height:auto}");
  child_ctx[17] = list[i];
  let div7;
  let div6;
  let div1;
  let div2;
  let t2_value = ctx[17].title + "";
  let t3;
  let div5;
  let div4;
  let t4;
  let div3;
  let div6_aria_label_value;
  let t5;
  let t6;
    return ctx[11](ctx[17]);
  }
  function click_handler_1() {
    return ctx[12](ctx[17]);
  function select_block_type_2(ctx2, dirty) {
    if (ctx2[3] == FileType.staged)
      return create_if_block_5;
    return create_else_block_1;
  }
  let current_block_type = select_block_type_2(ctx, -1);
  let if_block0 = current_block_type(ctx);
  function click_handler_5() {
    return ctx[16](ctx[17]);
  }
  let if_block1 = !ctx[5][ctx[17].title] && create_if_block_4(ctx);
      div7 = element("div");
      div6 = element("div");
      div1 = element("div");
      div1.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle"><path d="M3 8L12 17L21 8"></path></svg>`;
      t1 = space();
      div2 = element("div");
      t2 = text(t2_value);
      t3 = space();
      div5 = element("div");
      div4 = element("div");
      if_block0.c();
      t4 = space();
      div3 = element("div");
      t5 = space();
      if (if_block1)
        if_block1.c();
      t6 = space();
      attr(div0, "data-icon", "folder");
      set_style(div0, "padding-right", "5px");
      set_style(div0, "display", "flex");
      attr(div1, "class", "nav-folder-collapse-indicator collapse-icon");
      attr(div2, "class", "nav-folder-title-content svelte-148wteu");
      set_style(div3, "width", "11px");
      attr(div3, "class", "svelte-148wteu");
      attr(div4, "class", "buttons svelte-148wteu");
      attr(div5, "class", "tools svelte-148wteu");
      attr(div6, "class", "nav-folder-title");
      attr(div6, "aria-label-position", ctx[6]);
      attr(div6, "aria-label", div6_aria_label_value = ctx[17].vaultPath.split("/").last() != ctx[17].vaultPath ? ctx[17].vaultPath : "");
      attr(div7, "class", "nav-folder");
      toggle_class(div7, "is-collapsed", ctx[5][ctx[17].title]);
      insert(target, div7, anchor);
      append2(div7, div6);
      append2(div6, div0);
      append2(div6, t0);
      append2(div6, div1);
      append2(div6, t1);
      append2(div6, div2);
      append2(div2, t2);
      append2(div6, t3);
      append2(div6, div5);
      append2(div5, div4);
      if_block0.m(div4, null);
      append2(div4, t4);
      append2(div4, div3);
      append2(div7, t5);
      if (if_block1)
        if_block1.m(div7, null);
      append2(div7, t6);
        dispose = [
          listen(div1, "click", click_handler),
          listen(div2, "click", click_handler_1),
          listen(div6, "click", self2(click_handler_5))
        ];
      if ((!current || dirty & 1) && t2_value !== (t2_value = ctx[17].title + ""))
        set_data(t2, t2_value);
      if (current_block_type === (current_block_type = select_block_type_2(ctx, dirty)) && if_block0) {
        if_block0.p(ctx, dirty);
      } else {
        if_block0.d(1);
        if_block0 = current_block_type(ctx);
        if (if_block0) {
          if_block0.c();
          if_block0.m(div4, t4);
        }
      if (!current || dirty & 64) {
        attr(div6, "aria-label-position", ctx[6]);
      }
      if (!current || dirty & 1 && div6_aria_label_value !== (div6_aria_label_value = ctx[17].vaultPath.split("/").last() != ctx[17].vaultPath ? ctx[17].vaultPath : "")) {
        attr(div6, "aria-label", div6_aria_label_value);
      }
      if (!ctx[5][ctx[17].title]) {
        if (if_block1) {
          if_block1.p(ctx, dirty);
            transition_in(if_block1, 1);
          if_block1 = create_if_block_4(ctx);
          if_block1.c();
          transition_in(if_block1, 1);
          if_block1.m(div7, t6);
      } else if (if_block1) {
        transition_out(if_block1, 1, 1, () => {
          if_block1 = null;
      if (!current || dirty & 33) {
        toggle_class(div7, "is-collapsed", ctx[5][ctx[17].title]);
      }
      transition_in(if_block1);
      transition_out(if_block1);
        detach(div7);
      if_block0.d();
      if (if_block1)
        if_block1.d();
      run_all(dispose);
function create_else_block_1(ctx) {
  let div0;
  let t;
  let div1;
  let mounted;
  let dispose;
  function click_handler_3() {
    return ctx[14](ctx[17]);
  }
  function click_handler_4() {
    return ctx[15](ctx[17]);
  }
  return {
    c() {
      div0 = element("div");
      div0.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-undo"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>`;
      t = space();
      div1 = element("div");
      div1.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-plus"><line x1="9" y1="4" x2="9" y2="14"></line><line x1="4" y1="9" x2="14" y2="9"></line></svg>`;
      attr(div0, "data-icon", "undo");
      attr(div0, "aria-label", "Discard");
      attr(div0, "class", "clickable-icon svelte-148wteu");
      attr(div1, "data-icon", "plus");
      attr(div1, "aria-label", "Stage");
      attr(div1, "class", "clickable-icon svelte-148wteu");
    },
    m(target, anchor) {
      insert(target, div0, anchor);
      insert(target, t, anchor);
      insert(target, div1, anchor);
      if (!mounted) {
        dispose = [
          listen(div0, "click", click_handler_3),
          listen(div1, "click", click_handler_4)
        ];
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching)
        detach(div0);
      if (detaching)
        detach(t);
      if (detaching)
        detach(div1);
      mounted = false;
      run_all(dispose);
    }
  };
}
function create_if_block_5(ctx) {
  let div;
  let mounted;
  let dispose;
  function click_handler_2() {
    return ctx[13](ctx[17]);
  }
  return {
    c() {
      div = element("div");
      div.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-minus"><line x1="4" y1="9" x2="14" y2="9"></line></svg>`;
      attr(div, "data-icon", "minus");
      attr(div, "aria-label", "Unstage");
      attr(div, "class", "clickable-icon svelte-148wteu");
    },
    m(target, anchor) {
      insert(target, div, anchor);
      if (!mounted) {
        dispose = listen(div, "click", click_handler_2);
        mounted = true;
      }
    },
    p(new_ctx, dirty) {
      ctx = new_ctx;
    },
    d(detaching) {
      if (detaching)
        detach(div);
      mounted = false;
      dispose();
    }
  };
}
      hierarchy: ctx[17],
      attr(div, "class", "nav-folder-children");
        treecomponent_changes.hierarchy = ctx2[17];
            div_transition = create_bidirectional_transition(div, slide, { duration: 150 }, true);
          div_transition = create_bidirectional_transition(div, slide, { duration: 150 }, false);
      change: ctx[17].statusResult,
        pulledfilecomponent_changes.change = ctx2[17].statusResult;
      change: ctx[17].statusResult,
      view: ctx[2]
        filecomponent_changes.change = ctx2[17].statusResult;
      change: ctx[17].statusResult,
        stagedfilecomponent_changes.change = ctx2[17].statusResult;
    if (ctx2[17].statusResult)
      attr(main, "class", "svelte-148wteu");
      if (dirty & 2031) {
  let side;
  function stage(path2) {
    plugin.gitManager.stageAll({ dir: path2 }).finally(() => {
      dispatchEvent(new CustomEvent("git-refresh"));
    });
  }
  function unstage(path2) {
    plugin.gitManager.unstageAll({ dir: path2 }).finally(() => {
      dispatchEvent(new CustomEvent("git-refresh"));
    });
  }
  function discard(item) {
    new DiscardModal(view.app, false, item.vaultPath).myOpen().then((shouldDiscard) => {
      if (shouldDiscard === true) {
        plugin.gitManager.discardAll({
          dir: item.path,
          status: plugin.cachedStatus
        }).finally(() => {
          dispatchEvent(new CustomEvent("git-refresh"));
        });
      }
    });
  }
  function fold(item) {
    $$invalidate(5, closed[item.title] = !closed[item.title], closed);
  }
  const click_handler = (entity) => fold(entity);
  const click_handler_1 = (entity) => fold(entity);
  const click_handler_2 = (entity) => unstage(entity.path);
  const click_handler_3 = (entity) => discard(entity);
  const click_handler_4 = (entity) => stage(entity.path);
  const click_handler_5 = (entity) => fold(entity);
  $$self.$$.update = () => {
    if ($$self.$$.dirty & 4) {
      $:
        $$invalidate(6, side = view.leaf.getRoot().side == "left" ? "right" : "left");
    }
  };
  return [
    hierarchy,
    plugin,
    view,
    fileType,
    topLevel,
    closed,
    side,
    stage,
    unstage,
    discard,
    fold,
    click_handler,
    click_handler_1,
    click_handler_2,
    click_handler_3,
    click_handler_4,
    click_handler_5
  ];
  append_styles(target, "svelte-fnxzfa", `.commit-msg-input.svelte-fnxzfa.svelte-fnxzfa.svelte-fnxzfa{width:100%;overflow:hidden;resize:none;padding:7px 5px;background-color:var(--background-modifier-form-field)}.git-commit-msg.svelte-fnxzfa.svelte-fnxzfa.svelte-fnxzfa{position:relative;padding:0;width:calc(100% - var(--size-4-8));margin:4px auto}main.svelte-fnxzfa .tools.svelte-fnxzfa.svelte-fnxzfa{display:flex;margin-left:auto}main.svelte-fnxzfa .tools .buttons.svelte-fnxzfa.svelte-fnxzfa{display:flex}main.svelte-fnxzfa .tools .buttons.svelte-fnxzfa>.svelte-fnxzfa{padding:0 0;height:auto}main.svelte-fnxzfa .tools .files-count.svelte-fnxzfa.svelte-fnxzfa{padding-left:var(--size-2-1);width:11px;display:flex;align-items:center;justify-content:center}.git-commit-msg-clear-button.svelte-fnxzfa.svelte-fnxzfa.svelte-fnxzfa{position:absolute;background:transparent;border-radius:50%;color:var(--search-clear-button-color);cursor:var(--cursor);top:-4px;right:2px;bottom:0px;line-height:0;height:var(--input-height);width:28px;margin:auto;padding:0 0;text-align:center;display:flex;justify-content:center;align-items:center;transition:color 0.15s ease-in-out}.git-commit-msg-clear-button.svelte-fnxzfa.svelte-fnxzfa.svelte-fnxzfa:after{content:"";height:var(--search-clear-button-size);width:var(--search-clear-button-size);display:block;background-color:currentColor;-webkit-mask-image:url("data:image/svg+xml,<svg viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM3.8705 3.09766L6.00003 5.22718L8.12955 3.09766L8.9024 3.8705L6.77287 6.00003L8.9024 8.12955L8.12955 8.9024L6.00003 6.77287L3.8705 8.9024L3.09766 8.12955L5.22718 6.00003L3.09766 3.8705L3.8705 3.09766Z' fill='currentColor'/></svg>");-webkit-mask-repeat:no-repeat}.tree-item-flair.svelte-fnxzfa.svelte-fnxzfa.svelte-fnxzfa{margin-left:auto;align-items:center}`);
  child_ctx[45] = list[i];
  child_ctx[45] = list[i];
  child_ctx[50] = list[i];
      attr(div, "class", "git-commit-msg-clear-button svelte-fnxzfa");
        dispose = listen(div, "click", ctx[33]);
  let div18;
  let div17;
  let div7;
  let div6;
  let div0;
  let t0;
  let div5;
  let div3;
  let div2;
  let div4;
  let t4_value = ctx[6].staged.length + "";
  let t6;
  let div16;
  let div15;
  let div8;
  let t7;
  let div9;
  let div14;
  let div12;
  let div10;
  let div11;
  let div13;
  let t12_value = ctx[6].changed.length + "";
  let t12;
  let t13;
  let t14;
  let if_block2 = ctx[7].length > 0 && create_if_block_12(ctx);
      div18 = element("div");
      div17 = element("div");
      div7 = element("div");
      div6 = element("div");
      div0 = element("div");
      div0.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle"><path d="M3 8L12 17L21 8"></path></svg>`;
      t0 = space();
      div1.textContent = "Staged Changes";
      div5 = element("div");
      div3 = element("div");
      div2 = element("div");
      div2.innerHTML = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-minus"><line x1="4" y1="9" x2="14" y2="9"></line></svg>`;
      t3 = space();
      div4 = element("div");
      t4 = text(t4_value);
      t5 = space();
      t6 = space();
      div16 = element("div");
      div15 = element("div");
      div8 = element("div");
      div8.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle"><path d="M3 8L12 17L21 8"></path></svg>`;
      t7 = space();
      div9 = element("div");
      div9.textContent = "Changes";
      t9 = space();
      div14 = element("div");
      div12 = element("div");
      div10 = element("div");
      div10.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-undo"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>`;
      div11 = element("div");
      div11.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon lucide-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
      t11 = space();
      div13 = element("div");
      t12 = text(t12_value);
      t13 = space();
      t14 = space();
      attr(div0, "class", "nav-folder-collapse-indicator collapse-icon");
      attr(div1, "class", "nav-folder-title-content");
      attr(div2, "data-icon", "minus");
      attr(div2, "aria-label", "Unstage");
      attr(div2, "class", "clickable-icon svelte-fnxzfa");
      attr(div3, "class", "buttons svelte-fnxzfa");
      attr(div4, "class", "files-count svelte-fnxzfa");
      attr(div5, "class", "tools svelte-fnxzfa");
      attr(div6, "class", "nav-folder-title");
      attr(div7, "class", "staged nav-folder");
      toggle_class(div7, "is-collapsed", !ctx[13]);
      attr(div8, "class", "nav-folder-collapse-indicator collapse-icon");
      attr(div9, "class", "nav-folder-title-content");
      attr(div10, "data-icon", "undo");
      attr(div10, "aria-label", "Discard");
      attr(div10, "class", "clickable-icon svelte-fnxzfa");
      attr(div11, "data-icon", "plus");
      attr(div11, "aria-label", "Stage");
      attr(div11, "class", "clickable-icon svelte-fnxzfa");
      attr(div12, "class", "buttons svelte-fnxzfa");
      attr(div13, "class", "files-count svelte-fnxzfa");
      attr(div14, "class", "tools svelte-fnxzfa");
      attr(div15, "class", "nav-folder-title");
      attr(div16, "class", "changes nav-folder");
      toggle_class(div16, "is-collapsed", !ctx[12]);
      attr(div17, "class", "nav-folder-children");
      attr(div18, "class", "nav-folder mod-root");
      insert(target, div18, anchor);
      append2(div18, div17);
      append2(div17, div7);
      append2(div6, div0);
      append2(div6, t0);
      append2(div6, div1);
      append2(div6, t2);
      append2(div5, div3);
      append2(div3, div2);
      ctx[36](div2);
      append2(div5, t3);
      append2(div5, div4);
      append2(div4, t4);
      append2(div7, t5);
      if (if_block0)
        if_block0.m(div7, null);
      append2(div17, t6);
      append2(div17, div16);
      append2(div16, div15);
      append2(div15, div8);
      append2(div15, t7);
      append2(div15, div9);
      append2(div15, t9);
      append2(div15, div14);
      append2(div14, div12);
      append2(div12, div10);
      append2(div12, t10);
      append2(div12, div11);
      ctx[41](div11);
      append2(div14, t11);
      append2(div14, div13);
      append2(div13, t12);
      append2(div16, t13);
        if_block1.m(div16, null);
      append2(div17, t14);
        if_block2.m(div17, null);
          listen(div0, "click", ctx[34]),
          listen(div1, "click", ctx[35]),
          listen(div2, "click", ctx[19]),
          listen(div6, "click", self2(ctx[37])),
          listen(div8, "click", ctx[38]),
          listen(div9, "click", ctx[39]),
          listen(div10, "click", ctx[40]),
          listen(div11, "click", ctx[18]),
          listen(div15, "click", self2(ctx[42]))
      if ((!current || dirty[0] & 64) && t4_value !== (t4_value = ctx2[6].staged.length + ""))
        set_data(t4, t4_value);
          if_block0.m(div7, null);
      if (!current || dirty[0] & 8192) {
        toggle_class(div7, "is-collapsed", !ctx2[13]);
      if ((!current || dirty[0] & 64) && t12_value !== (t12_value = ctx2[6].changed.length + ""))
        set_data(t12, t12_value);
          if_block1.m(div16, null);
      if (!current || dirty[0] & 4096) {
        toggle_class(div16, "is-collapsed", !ctx2[12]);
      }
      if (ctx2[7].length > 0) {
          if (dirty[0] & 128) {
          if_block2.m(div17, null);
        detach(div18);
      ctx[36](null);
      ctx[41](null);
        if_block2.d();
    if (ctx2[3])
      attr(div, "class", "nav-folder-children");
  let each_value_2 = ctx[6].staged;
      if (dirty[0] & 67) {
        each_value_2 = ctx2[6].staged;
      change: ctx[50],
      if (dirty[0] & 64)
        stagedfilecomponent_changes.change = ctx2[50];
  const if_block_creators = [create_if_block_52, create_else_block_12];
    if (ctx2[3])
      attr(div, "class", "nav-folder-children");
function create_else_block_12(ctx) {
  let each_value_1 = ctx[6].changed;
      if (dirty[0] & 67) {
        each_value_1 = ctx2[6].changed;
function create_if_block_52(ctx) {
      change: ctx[45],
      manager: ctx[0].gitManager
      if (dirty[0] & 64)
        filecomponent_changes.change = ctx2[45];
  let div0;
  let t0;
  let span;
  let t3_value = ctx[7].length + "";
      div0 = element("div");
      div0.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle"><path d="M3 8L12 17L21 8"></path></svg>`;
      t0 = space();
      div1.textContent = "Recently Pulled Files";
      span = element("span");
      attr(div0, "class", "nav-folder-collapse-indicator collapse-icon");
      attr(div1, "class", "nav-folder-title-content");
      attr(span, "class", "tree-item-flair svelte-fnxzfa");
      attr(div2, "class", "nav-folder-title");
      attr(div3, "class", "pulled nav-folder");
      toggle_class(div3, "is-collapsed", !ctx[14]);
      append2(div2, div0);
      append2(div2, t0);
      append2(div2, span);
      append2(span, t3);
        dispose = listen(div2, "click", ctx[43]);
      if ((!current || dirty[0] & 128) && t3_value !== (t3_value = ctx2[7].length + ""))
      if (!current || dirty[0] & 16384) {
        toggle_class(div3, "is-collapsed", !ctx2[14]);
      }
    if (ctx2[3])
      attr(div, "class", "nav-folder-children");
  let each_value = ctx[7];
      if (dirty[0] & 130) {
        each_value = ctx2[7];
      change: ctx[45],
      if (dirty[0] & 128)
        pulledfilecomponent_changes.change = ctx2[45];
  let div8;
  let div6;
  let div7;
  let textarea;
  let t8;
  let t9;
  let div11;
  let if_block0 = ctx[2] && create_if_block_8(ctx);
  let if_block1 = ctx[6] && ctx[10] && ctx[9] && create_if_block4(ctx);
      div8 = element("div");
      div6 = element("div");
      div7 = element("div");
      div10 = element("div");
      textarea = element("textarea");
      t8 = space();
      t9 = space();
      div11 = element("div");
      attr(div0, "id", "backup-btn");
      attr(div0, "data-icon", "arrow-up-circle");
      attr(div0, "class", "clickable-icon nav-action-button");
      attr(div0, "aria-label", "Backup");
      attr(div1, "id", "commit-btn");
      attr(div1, "data-icon", "check");
      attr(div1, "class", "clickable-icon nav-action-button");
      attr(div1, "aria-label", "Commit");
      attr(div2, "id", "stage-all");
      attr(div2, "class", "clickable-icon nav-action-button");
      attr(div2, "data-icon", "plus-circle");
      attr(div2, "aria-label", "Stage all");
      attr(div3, "id", "unstage-all");
      attr(div3, "class", "clickable-icon nav-action-button");
      attr(div3, "data-icon", "minus-circle");
      attr(div3, "aria-label", "Unstage all");
      attr(div4, "id", "push");
      attr(div4, "class", "clickable-icon nav-action-button");
      attr(div4, "data-icon", "upload");
      attr(div4, "aria-label", "Push");
      attr(div5, "id", "pull");
      attr(div5, "class", "clickable-icon nav-action-button");
      attr(div5, "data-icon", "download");
      attr(div5, "aria-label", "Pull");
      attr(div6, "id", "layoutChange");
      attr(div6, "class", "clickable-icon nav-action-button");
      attr(div6, "aria-label", "Change Layout");
      attr(div7, "class", "clickable-icon nav-action-button");
      set_style(div7, "margin", "1px");
      toggle_class(div7, "loading", ctx[5]);
      attr(div8, "class", "nav-buttons-container");
      attr(div9, "class", "nav-header");
      attr(textarea, "rows", ctx[15]);
      attr(textarea, "class", "commit-msg-input svelte-fnxzfa");
      attr(div10, "class", "git-commit-msg svelte-fnxzfa");
      attr(div11, "class", "nav-files-container");
      set_style(div11, "position", "relative");
      attr(main, "class", "svelte-fnxzfa");
      append2(div8, div0);
      ctx[23](div0);
      append2(div8, t0);
      append2(div8, div1);
      ctx[24](div1);
      append2(div8, t1);
      append2(div8, div2);
      ctx[25](div2);
      append2(div8, t2);
      append2(div8, div3);
      ctx[26](div3);
      append2(div8, t3);
      append2(div8, div4);
      ctx[27](div4);
      append2(div8, t4);
      append2(div8, div5);
      ctx[28](div5);
      append2(div8, t5);
      append2(div8, div6);
      ctx[29](div6);
      append2(div8, t6);
      append2(div8, div7);
      ctx[31](div7);
      append2(main, t7);
      append2(div10, textarea);
      set_input_value(textarea, ctx[2]);
      append2(div10, t8);
      if (if_block0)
        if_block0.m(div10, null);
      append2(main, t9);
      append2(main, div11);
        if_block1.m(div11, null);
          listen(div0, "click", ctx[17]),
          listen(div2, "click", ctx[18]),
          listen(div3, "click", ctx[19]),
          listen(div4, "click", ctx[20]),
          listen(div5, "click", ctx[21]),