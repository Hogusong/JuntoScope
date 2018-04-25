import { Firestore } from "@google-cloud/firestore";
import { encryptionService } from '.';

// Shuffled alphanumerics w/o vowels and ambiguous I, l, 1, 0, O, o.
const CHARS = 'vdR8gYZ43DpNJPQkBnWXGtysHfF7z2x-Mjh9bK6Tr5c_wVLCSqm';
const BASE = CHARS.length;

export class SessionCodeService {
  sessionsRef = this.firestore.doc('/public/sessions');
  linksRef = this.sessionsRef.collection('/links');

  constructor(private firestore: Firestore) {}

  async generateCode(userId, connectionId, projectId, sessionId) {
    const newId = await this.firestore.runTransaction(t => {
      return t.get(this.sessionsRef)
        .then(doc => {
          let fn, count;
          let increment = Math.floor(Math.random() * 128) + 32;

          if (!doc.exists) {
            fn = 'create';
            count = 1000000 + increment;
          } else {
            fn = 'update';
            count = doc.data().count + increment;
          }

          t[fn](this.sessionsRef, { count })

          return Promise.resolve(count);
        });
    });

    await this.linksRef.doc(`${newId}`).set({
      userId,
      connectionId,
      projectId,
      sessionId,
    });

    return this.encode(newId);
  }

  // Bijective Enumeration -- Number to String
  private encode(id: number) {
    let encoded = '';

    while (id > 0) {
      encoded = CHARS.charAt(id % BASE) + encoded;
      id = Math.floor(id / BASE);
    }

    return encoded;
  }

  // Bijective Enumeration -- String to Number
  private decode(str: string) {
    let id = 0;

    for (let i = 0, len = str.length; i < len; i++) {
      id = (id * BASE) + CHARS.indexOf(str.charAt(i));
    }

    return id;
  }

  async validateSession(encodedSessionLink, accessCode, uid) {
    const sessionLink = this.decode(encodedSessionLink);
    const sessionsRef = this.firestore.doc('/public/sessions');
    const linksRef = sessionsRef.collection('/links');
    const linkSeshRef = linksRef.doc(sessionLink.toString());

    let seshInfo;
    let seshUri;
    let sessionRef;
    let encryptedCode;

    await linkSeshRef.get().then((doc) => {
      seshInfo = doc.data();
      seshUri = `/users/${seshInfo.userId}/connections/${seshInfo.connectionId}/projects/${seshInfo.projectId}/sessions/${seshInfo.sessionId}`;
    })

    sessionRef = this.firestore.doc(seshUri);

    await sessionRef.get().then((doc) => {
      encryptedCode = doc.data().accessCode;
    });

    if (accessCode == encryptionService.decrypt(encryptedCode)) {
      linkSeshRef.set({ users: {
        [uid]: true,
      }, }, { merge: true });

      return seshInfo;
    } else {
      return { error: "Invalid Access Code" };
    }

  }
}
