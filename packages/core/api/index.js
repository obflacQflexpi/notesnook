import Notes from "../collections/notes";
import Storage from "../database/storage";
import Notebooks from "../collections/notebooks";
import Trash from "../collections/trash";
import Tags from "../collections/tags";
import User from "../models/user";
import Sync from "./sync";
import Vault from "./vault";
import Lookup from "./lookup";
import Content from "../collections/content";
import Conflicts from "./conflicts";

class Database {
  constructor(context) {
    this.context = new Storage(context);
  }

  async init() {
    this.user = new User(this.context);
    this.syncer = new Sync(this);
    this.vault = new Vault(this);
    this.conflicts = new Conflicts(this);
    this.lookup = new Lookup(this);

    // collections
    /** @type {Notes} */
    this.notes = await Notes.new(this);
    /** @type {Notebooks} */
    this.notebooks = await Notebooks.new(this);
    /** @type {Tags} */
    this.tags = await Tags.new(this, "tags");
    /** @type {Tags} */
    this.colors = await Tags.new(this, "colors");
    /** @type {Trash} */
    this.trash = await Trash.new(this);
    /** @type {Content} */
    this.delta = await Content.new(this, false, "delta");
    /** @type {Content} */
    this.text = await Content.new(this, false, "text");
  }

  sync() {
    return this.syncer.start();
  }
}

export default Database;
