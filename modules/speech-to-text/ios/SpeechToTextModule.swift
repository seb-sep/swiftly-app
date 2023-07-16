import ExpoModulesCore
import Foundation
import AVFoundation
import Speech


public class SpeechToTextModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('SpeechToText')` in JavaScript.
    Name("SpeechToText")

    // Sets constant properties on the module. Can take a dictionary or a closure that returns a dictionary.
    Constants([
      "PI": Double.pi
    ])

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(SpeechToTextView.self) {
      // Defines a setter for the `name` prop.
      Prop("name") { (view: SpeechToTextView, prop: String) in
        print(prop)
      }
    }
  }
}




/// A helper for transcribing speech to text using SFSpeechRecognizer and AVAudioEngine.

actor SpeechRecognizer {

    enum RecognizerError: Error {

        case nilRecognizer

        case notAuthorizedToRecognize

        case notPermittedToRecord

        case recognizerIsUnavailable

        

        var message: String {

            switch self {

            case .nilRecognizer: return "Can't initialize speech recognizer"

            case .notAuthorizedToRecognize: return "Not authorized to recognize speech"

            case .notPermittedToRecord: return "Not permitted to record audio"

            case .recognizerIsUnavailable: return "Recognizer is unavailable"

            }

        }

    }

    

    @MainActor var transcript: String = ""

    

    private var audioEngine: AVAudioEngine?

    private var request: SFSpeechAudioBufferRecognitionRequest?

    private var task: SFSpeechRecognitionTask?

    private let recognizer: SFSpeechRecognizer?

    

    /**

     Initializes a new speech recognizer. If this is the first time you've used the class, it

     requests access to the speech recognizer and the microphone.

     */

    init() {

        recognizer = SFSpeechRecognizer()

        guard recognizer != nil else {

            transcribe(RecognizerError.nilRecognizer)

            return

        }

        

        Task {

            do {

                guard await SFSpeechRecognizer.hasAuthorizationToRecognize() else {

                    throw RecognizerError.notAuthorizedToRecognize

                }

                guard await AVAudioSession.sharedInstance().hasPermissionToRecord() else {

                    throw RecognizerError.notPermittedToRecord

                }

            } catch {

                transcribe(error)

            }

        }

    }

    

    @MainActor func startTranscribing() {

        Task {

            await transcribe()

        }

    }

    

    @MainActor func resetTranscript() {

        Task {

            await reset()

        }

    }

    

    @MainActor func stopTranscribing() {

        Task {

            await reset()

        }

    }

    

    /**

     Begin transcribing audio.

     

     Creates a `SFSpeechRecognitionTask` that transcribes speech to text until you call `stopTranscribing()`.

     The resulting transcription is continuously written to the published `transcript` property.

     */

    private func transcribe() {

        guard let recognizer, recognizer.isAvailable else {

            self.transcribe(RecognizerError.recognizerIsUnavailable)

            return

        }

        

        do {

            let (audioEngine, request) = try Self.prepareEngine()

            self.audioEngine = audioEngine

            self.request = request

            self.task = recognizer.recognitionTask(with: request, resultHandler: { [weak self] result, error in

                self?.recognitionHandler(audioEngine: audioEngine, result: result, error: error)

            })

        } catch {

            self.reset()

            self.transcribe(error)

        }

    }

    

    /// Reset the speech recognizer.

    private func reset() {

        task?.cancel()

        audioEngine?.stop()

        audioEngine = nil

        request = nil

        task = nil

    }

    

    private static func prepareEngine() throws -> (AVAudioEngine, SFSpeechAudioBufferRecognitionRequest) {

        let audioEngine = AVAudioEngine()

        

        let request = SFSpeechAudioBufferRecognitionRequest()

        request.shouldReportPartialResults = true

        

        let audioSession = AVAudioSession.sharedInstance()

        try audioSession.setCategory(.playAndRecord, mode: .measurement, options: .duckOthers)

        try audioSession.setActive(true, options: .notifyOthersOnDeactivation)

        let inputNode = audioEngine.inputNode

        

        let recordingFormat = inputNode.outputFormat(forBus: 0)

        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in

            request.append(buffer)

        }

        audioEngine.prepare()

        try audioEngine.start()

        

        return (audioEngine, request)

    }

    

    nonisolated private func recognitionHandler(audioEngine: AVAudioEngine, result: SFSpeechRecognitionResult?, error: Error?) {

        let receivedFinalResult = result?.isFinal ?? false

        let receivedError = error != nil

        

        if receivedFinalResult || receivedError {

            audioEngine.stop()

            audioEngine.inputNode.removeTap(onBus: 0)

        }

        

        if let result {

            transcribe(result.bestTranscription.formattedString)

        }

    }

    

    

    nonisolated private func transcribe(_ message: String) {

        Task { @MainActor in

            transcript = message

        }

    }

    nonisolated private func transcribe(_ error: Error) {

        var errorMessage = ""

        if let error = error as? RecognizerError {

            errorMessage += error.message

        } else {

            errorMessage += error.localizedDescription

        }

        Task { @MainActor [errorMessage] in

            transcript = "<< \(errorMessage) >>"

        }

    }

}



extension SFSpeechRecognizer {

    static func hasAuthorizationToRecognize() async -> Bool {

        await withCheckedContinuation { continuation in

            requestAuthorization { status in

                continuation.resume(returning: status == .authorized)

            }

        }

    }

}



extension AVAudioSession {

    func hasPermissionToRecord() async -> Bool {

        await withCheckedContinuation { continuation in

            requestRecordPermission { authorized in

                continuation.resume(returning: authorized)

            }

        }

    }

}
k
